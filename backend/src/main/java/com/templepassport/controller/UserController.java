package com.templepassport.controller;

import com.templepassport.dto.*;
import com.templepassport.repository.UserRepository;
import com.templepassport.service.AvatarStorageService;
import com.templepassport.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepo;
    private final AvatarStorageService avatarStorageService;

    public UserController(UserService userService, UserRepository userRepo, AvatarStorageService avatarStorageService) {
        this.userService = userService;
        this.userRepo = userRepo;
        this.avatarStorageService = avatarStorageService;
    }

    public record UpdateProfileRequest(String name, String city, String state, LocalDate dob) {}

    @PatchMapping("/{id}/profile")
    public ResponseEntity<Map<String, String>> updateProfile(@PathVariable UUID id,
                                                             @RequestBody UpdateProfileRequest req,
                                                             HttpServletRequest request) {
        UUID authenticatedId = (UUID) request.getAttribute("userId");
        if (!id.equals(authenticatedId)) return ResponseEntity.status(403).build();

        if (req.name() == null || req.name().isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Name is required"));
        if (req.name().length() > 60)
            return ResponseEntity.badRequest().body(Map.of("message", "Name must be 60 characters or fewer"));
        if (req.city() != null && req.city().length() > 60)
            return ResponseEntity.badRequest().body(Map.of("message", "City must be 60 characters or fewer"));
        if (req.state() != null && req.state().length() > 60)
            return ResponseEntity.badRequest().body(Map.of("message", "State must be 60 characters or fewer"));
        if (req.dob() != null) {
            if (req.dob().isAfter(LocalDate.now()))
                return ResponseEntity.badRequest().body(Map.of("message", "Date of birth cannot be in the future"));
            if (req.dob().isAfter(LocalDate.now().minusYears(5)))
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid date of birth"));
        }

        userRepo.findById(id).ifPresent(u -> {
            u.setName(req.name().trim());
            if (req.city()  != null) u.setCity(req.city().trim());
            if (req.state() != null) u.setStateName(req.state().trim());
            if (req.dob()   != null) u.setDateOfBirth(req.dob());
            userRepo.save(u);
        });
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadAvatar(@PathVariable UUID id,
                                                            @RequestParam("file") MultipartFile file,
                                                            HttpServletRequest request) throws IOException {
        UUID authenticatedId = (UUID) request.getAttribute("userId");
        if (!id.equals(authenticatedId)) return ResponseEntity.status(403).build();

        if (file.isEmpty() || file.getSize() > 2 * 1024 * 1024)
            return ResponseEntity.badRequest().body(Map.of("message", "File must be non-empty and under 2 MB"));

        String ct = file.getContentType();
        if (ct == null || (!ct.equals("image/jpeg") && !ct.equals("image/png") && !ct.equals("image/webp")))
            return ResponseEntity.badRequest().body(Map.of("message", "Only JPEG, PNG and WebP are accepted"));

        String url = avatarStorageService.uploadAvatar(id, file.getBytes());
        userRepo.findById(id).ifPresent(u -> { u.setProfilePictureUrl(url); userRepo.save(u); });
        return ResponseEntity.ok(Map.of("url", url));
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
