package com.templepassport.service;

import com.templepassport.model.User;
import com.templepassport.model.UserAchievement;
import com.templepassport.model.VerificationType;
import com.templepassport.repository.AchievementRepository;
import com.templepassport.repository.CheckInRepository;
import com.templepassport.repository.CollectionRepository;
import com.templepassport.repository.UserAchievementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
public class AchievementService {

    private final CheckInRepository checkInRepo;
    private final AchievementRepository achievementRepo;
    private final UserAchievementRepository userAchievementRepo;
    private final CollectionRepository collectionRepo;

    public AchievementService(CheckInRepository checkInRepo,
                              AchievementRepository achievementRepo,
                              UserAchievementRepository userAchievementRepo,
                              CollectionRepository collectionRepo) {
        this.checkInRepo = checkInRepo;
        this.achievementRepo = achievementRepo;
        this.userAchievementRepo = userAchievementRepo;
        this.collectionRepo = collectionRepo;
    }

    @Transactional
    public void evaluateAndAward(User user) {
        long temples  = checkInRepo.countDistinctTemplesByUserId(user.getId());
        long verified = checkInRepo.countByUserIdAndType(user.getId(), VerificationType.VERIFIED);
        long states   = checkInRepo.countDistinctStatesByUserId(user.getId());

        award(user, "FIRST_TEMPLE",   temples >= 1);
        award(user, "FIRST_VERIFIED", verified >= 1);
        award(user, "TEMPLES_10",     temples >= 10);
        award(user, "TEMPLES_25",     temples >= 25);
        award(user, "TEMPLES_50",     temples >= 50);
        award(user, "TEMPLES_100",    temples >= 100);
        award(user, "STATES_10",      states >= 10);
        award(user, "STATES_25",      states >= 25);

        evaluateCollectionAchievements(user);
    }

    private void evaluateCollectionAchievements(User user) {
        Set<java.util.UUID> visited = checkInRepo.findDistinctTempleIdsByUserId(user.getId());

        collectionRepo.findAllWithTemples().forEach(col -> {
            long collVisited = col.getTemples().stream()
                    .filter(t -> visited.contains(t.getId()))
                    .count();
            boolean complete = collVisited >= col.getTotalCount() && col.getTotalCount() > 0;

            if ("JYOTIRLINGA".equals(col.getType()))  award(user, "JYOTIRLINGA_COMPLETE", complete);
            if ("CHAR_DHAM".equals(col.getType()))    award(user, "CHAR_DHAM_COMPLETE",   complete);
        });
    }

    private void award(User user, String code, boolean condition) {
        if (!condition) return;
        if (userAchievementRepo.existsByUser_IdAndAchievement_Code(user.getId(), code)) return;
        achievementRepo.findByCode(code).ifPresent(a -> {
            var ua = new UserAchievement();
            ua.setUser(user);
            ua.setAchievement(a);
            userAchievementRepo.save(ua);
        });
    }
}
