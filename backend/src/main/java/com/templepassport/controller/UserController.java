package com.templepassport.controller;

import com.templepassport.dto.*;
import com.templepassport.repository.UserRepository;
import com.templepassport.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepo;

    public UserController(UserService userService, UserRepository userRepo) {
        this.userService = userService;
        this.userRepo = userRepo;
    }

    public record UpdateProfileRequest(String name, String city, String state) {}

    @PatchMapping("/{id}/profile")
    public ResponseEntity<Void> updateProfile(@PathVariable UUID id,
                                              @RequestBody UpdateProfileRequest req,
                                              HttpServletRequest request) {
        UUID authenticatedId = (UUID) request.getAttribute("userId");
        if (!id.equals(authenticatedId)) {
            return ResponseEntity.status(403).build();
        }
        userRepo.findById(id).ifPresent(u -> {
            if (req.name()  != null && !req.name().isBlank()) u.setName(req.name());
            if (req.city()  != null) u.setCity(req.city());
            if (req.state() != null) u.setStateName(req.state());
            userRepo.save(u);
        });
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/stats")
    public UserStatsDto getStats(@PathVariable UUID id) {
        return userService.getStats(id);
    }

    @GetMapping("/{id}/checkins")
    public List<CheckInDetailResponse> getTimeline(@PathVariable UUID id) {
        return userService.getTimeline(id);
    }

    @GetMapping("/{id}/stamps")
    public List<CheckInDetailResponse> getStamps(@PathVariable UUID id) {
        return userService.getStamps(id);
    }

    @GetMapping("/{id}/achievements")
    public List<AchievementDto> getAchievements(@PathVariable UUID id) {
        return userService.buildAchievements(id);
    }

    @GetMapping("/{id}/collections")
    public List<CollectionDetailDto> getCollections(@PathVariable UUID id) {
        return userService.getCollections(id);
    }
}
