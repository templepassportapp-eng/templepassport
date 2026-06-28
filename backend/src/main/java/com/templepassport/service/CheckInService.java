package com.templepassport.service;

import com.templepassport.dto.CheckInRequest;
import com.templepassport.dto.CheckInResponse;
import com.templepassport.model.CheckIn;
import com.templepassport.model.Temple;
import com.templepassport.model.VerificationType;
import com.templepassport.repository.CheckInRepository;
import com.templepassport.repository.TempleRepository;
import com.templepassport.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class CheckInService {

    private static final int DEFAULT_RADIUS_M = 750;

    private final CheckInRepository checkInRepo;
    private final TempleRepository templeRepo;
    private final UserRepository userRepo;
    private final AchievementService achievementService;

    public CheckInService(CheckInRepository checkInRepo, TempleRepository templeRepo,
                          UserRepository userRepo, AchievementService achievementService) {
        this.checkInRepo = checkInRepo;
        this.templeRepo = templeRepo;
        this.userRepo = userRepo;
        this.achievementService = achievementService;
    }

    @Transactional
    public CheckInResponse create(CheckInRequest req) {
        var user = userRepo.findById(req.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + req.userId()));
        var temple = templeRepo.findById(req.templeId())
                .orElseThrow(() -> new IllegalArgumentException("Temple not found: " + req.templeId()));

        var checkIn = new CheckIn();
        checkIn.setUser(user);
        checkIn.setTemple(temple);
        checkIn.setVisitDate(req.visitDate() != null ? req.visitDate() : LocalDate.now());
        checkIn.setVerificationType(determineVerification(req, temple));
        checkIn.setLatitude(req.latitude());
        checkIn.setLongitude(req.longitude());
        checkIn.setNotes(req.notes());
        checkIn.setPhotoUrl(req.photoUrl());

        var saved = checkInRepo.save(checkIn);
        achievementService.evaluateAndAward(user);
        return CheckInResponse.from(saved);
    }

    private VerificationType determineVerification(CheckInRequest req, Temple temple) {
        if (req.latitude() == null || req.longitude() == null) {
            return VerificationType.SELF_REPORTED;
        }
        int radius = temple.getVerificationRadius() != null ? temple.getVerificationRadius() : DEFAULT_RADIUS_M;
        double dist = haversineMeters(req.latitude(), req.longitude(), temple.getLatitude(), temple.getLongitude());
        return dist <= radius ? VerificationType.VERIFIED : VerificationType.SELF_REPORTED;
    }

    private double haversineMeters(double lat1, double lon1, double lat2, double lon2) {
        double R = 6_371_000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
