package com.templepassport.service;

import com.templepassport.dto.*;
import com.templepassport.model.VerificationType;
import com.templepassport.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepo;
    private final CheckInRepository checkInRepo;
    private final CollectionRepository collectionRepo;
    private final AchievementRepository achievementRepo;
    private final UserAchievementRepository userAchievementRepo;

    public UserService(UserRepository userRepo,
                       CheckInRepository checkInRepo,
                       CollectionRepository collectionRepo,
                       AchievementRepository achievementRepo,
                       UserAchievementRepository userAchievementRepo) {
        this.userRepo = userRepo;
        this.checkInRepo = checkInRepo;
        this.collectionRepo = collectionRepo;
        this.achievementRepo = achievementRepo;
        this.userAchievementRepo = userAchievementRepo;
    }

    @Transactional(readOnly = true)
    public UserStatsDto getStats(UUID userId) {
        var user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        int temples  = (int) checkInRepo.countDistinctTemplesByUserId(userId);
        int verified = (int) checkInRepo.countByUserIdAndType(userId, VerificationType.VERIFIED);
        int states   = (int) checkInRepo.countDistinctStatesByUserId(userId);

        Set<UUID> visitedTempleIds = checkInRepo.findDistinctTempleIdsByUserId(userId);

        List<CollectionProgressDto> collections = collectionRepo.findAllWithTemples().stream()
                .map(c -> {
                    long v = c.getTemples().stream().filter(t -> visitedTempleIds.contains(t.getId())).count();
                    return new CollectionProgressDto(c.getId().toString(), c.getName(), c.getType(), (int) v, c.getTotalCount());
                })
                .toList();

        List<AchievementDto> achievements = buildAchievements(userId);

        return new UserStatsDto(userId.toString(), user.getName(), user.getEmail(),
                temples, verified, states, 36, collections, achievements);
    }

    @Transactional(readOnly = true)
    public List<CheckInDetailResponse> getTimeline(UUID userId) {
        return checkInRepo.findByUserIdWithTemple(userId)
                .stream().map(CheckInDetailResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<CheckInDetailResponse> getStamps(UUID userId) {
        return checkInRepo.findByUserIdAndTypeWithTemple(userId, VerificationType.VERIFIED)
                .stream().map(CheckInDetailResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<AchievementDto> buildAchievements(UUID userId) {
        var earned = userAchievementRepo.findByUser_Id(userId);
        Map<String, String> earnedAt = earned.stream()
                .collect(Collectors.toMap(ua -> ua.getAchievement().getCode(),
                        ua -> ua.getEarnedAt().toString()));

        return achievementRepo.findAll().stream()
                .map(a -> new AchievementDto(
                        a.getCode(), a.getName(), a.getDescription(), a.getIconName(),
                        earnedAt.containsKey(a.getCode()),
                        earnedAt.get(a.getCode())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CollectionDetailDto> getCollections(UUID userId) {
        Set<UUID> visited = checkInRepo.findDistinctTempleIdsByUserId(userId);
        return collectionRepo.findAllWithTemples().stream()
                .map(c -> {
                    var temples = c.getTemples().stream()
                            .map(t -> new CollectionDetailDto.CollectionTempleDto(
                                    t.getId().toString(), t.getName(), t.getState(),
                                    t.getImageUrl(), visited.contains(t.getId())))
                            .toList();
                    long v = temples.stream().filter(CollectionDetailDto.CollectionTempleDto::visited).count();
                    return new CollectionDetailDto(c.getId().toString(), c.getName(),
                            c.getDescription(), c.getType(), (int) v, c.getTotalCount(), temples);
                })
                .toList();
    }
}
