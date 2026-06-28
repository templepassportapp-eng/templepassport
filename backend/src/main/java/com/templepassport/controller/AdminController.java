package com.templepassport.controller;

import com.templepassport.model.Affiliate;
import com.templepassport.model.FeatureFlag;
import com.templepassport.model.Temple;
import com.templepassport.model.TempleCategory;
import com.templepassport.model.User;
import com.templepassport.repository.AffiliateRepository;
import com.templepassport.repository.FeatureFlagRepository;
import com.templepassport.repository.TempleCategoryRepository;
import com.templepassport.repository.TempleRepository;
import com.templepassport.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Admin REST API — all endpoints under /api/admin/ are protected by AdminJwtFilter.
 * The filter attaches "adminUsername" as a request attribute after token validation.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final FeatureFlagRepository flagRepo;
    private final AffiliateRepository affiliateRepo;
    private final TempleRepository templeRepo;
    private final TempleCategoryRepository categoryRepo;
    private final UserRepository userRepo;

    public AdminController(FeatureFlagRepository flagRepo,
                           AffiliateRepository affiliateRepo,
                           TempleRepository templeRepo,
                           TempleCategoryRepository categoryRepo,
                           UserRepository userRepo) {
        this.flagRepo = flagRepo;
        this.affiliateRepo = affiliateRepo;
        this.templeRepo = templeRepo;
        this.categoryRepo = categoryRepo;
        this.userRepo = userRepo;
    }

    private String adminUsername(HttpServletRequest req) {
        Object attr = req.getAttribute("adminUsername");
        return attr != null ? attr.toString() : "admin";
    }

    // ── Dashboard stats ──────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        // TODO: add real counts for posts/groups once social tables are migrated
        return ResponseEntity.ok(Map.of(
            "totalTemples",  templeRepo.count(),
            "totalUsers",    userRepo.count(),
            "totalCheckIns", 0L,
            "totalPosts",    0L,
            "totalGroups",   0L,
            "activeGroups",  0L
        ));
    }

    // ── Feature flags ────────────────────────────────────────────────────────

    @GetMapping("/feature-flags")
    public List<FeatureFlag> getFlags() {
        return flagRepo.findAll();
    }

    @PatchMapping("/feature-flags/{key}")
    public ResponseEntity<FeatureFlag> setFlag(
            @PathVariable String key,
            @RequestBody Map<String, Object> body,
            HttpServletRequest req) {
        return flagRepo.findById(key)
            .map(flag -> {
                flag.setEnabled((Boolean) body.get("enabled"));
                flag.setUpdatedAt(Instant.now());
                flag.setUpdatedBy(adminUsername(req));
                return ResponseEntity.ok(flagRepo.save(flag));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // ── Affiliates ───────────────────────────────────────────────────────────

    @GetMapping("/affiliates")
    public List<Affiliate> getAffiliates() {
        return affiliateRepo.findAll();
    }

    @PostMapping("/affiliates")
    public ResponseEntity<Affiliate> createAffiliate(@RequestBody Affiliate body) {
        body.setEnabled(true);
        return ResponseEntity.ok(affiliateRepo.save(body));
    }

    @PutMapping("/affiliates/{id}")
    public ResponseEntity<Affiliate> updateAffiliate(
            @PathVariable UUID id,
            @RequestBody Affiliate body) {
        return affiliateRepo.findById(id)
            .map(existing -> {
                existing.setName(body.getName());
                existing.setType(body.getType());
                existing.setDescription(body.getDescription());
                existing.setWebsiteUrl(body.getWebsiteUrl());
                existing.setContactEmail(body.getContactEmail());
                existing.setContactPhone(body.getContactPhone());
                existing.setCommissionPct(body.getCommissionPct());
                return ResponseEntity.ok(affiliateRepo.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/affiliates/{id}/enabled")
    public ResponseEntity<Affiliate> toggleAffiliate(
            @PathVariable UUID id,
            @RequestBody Map<String, Boolean> body) {
        return affiliateRepo.findById(id)
            .map(a -> {
                a.setEnabled(body.get("enabled"));
                return ResponseEntity.ok(affiliateRepo.save(a));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // ── Temple categories ────────────────────────────────────────────────────

    @GetMapping("/temple-categories")
    public List<TempleCategory> getCategories() {
        return categoryRepo.findAll();
    }

    @PostMapping("/temple-categories")
    public ResponseEntity<?> createCategory(@RequestBody TempleCategory body) {
        if (categoryRepo.existsById(body.getKey())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Category key already exists"));
        }
        body.setCustom(true);
        return ResponseEntity.ok(categoryRepo.save(body));
    }

    // ── Temples (admin) ──────────────────────────────────────────────────────

    @PostMapping("/temples")
    public ResponseEntity<Temple> createTemple(@RequestBody Temple body) {
        // Sync single-value category field from categories list for backward compat
        if (body.getCategories() != null && !body.getCategories().isEmpty()) {
            body.setCategory(body.getCategories().get(0));
        }
        return ResponseEntity.ok(templeRepo.save(body));
    }

    @PutMapping("/temples/{id}")
    public ResponseEntity<Temple> updateTemple(
            @PathVariable UUID id,
            @RequestBody Temple body) {
        return templeRepo.findById(id)
            .map(existing -> {
                existing.setName(body.getName());
                existing.setDeity(body.getDeity());
                existing.setCity(body.getCity());
                existing.setDistrict(body.getDistrict());
                existing.setState(body.getState());
                existing.setPincode(body.getPincode());
                existing.setLatitude(body.getLatitude());
                existing.setLongitude(body.getLongitude());
                existing.setVerificationRadius(body.getVerificationRadius());
                existing.setDescription(body.getDescription());
                existing.setCategories(body.getCategories());
                // Keep single-value category in sync for backward compat
                if (body.getCategories() != null && !body.getCategories().isEmpty()) {
                    existing.setCategory(body.getCategories().get(0));
                }
                return ResponseEntity.ok(templeRepo.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // ── User management ──────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<?> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageResult = userRepo.findAll(PageRequest.of(page, size));
        return ResponseEntity.ok(Map.of(
            "content", pageResult.getContent(),
            "totalElements", pageResult.getTotalElements(),
            "totalPages", pageResult.getTotalPages()
        ));
    }

    @PostMapping("/users")
    public ResponseEntity<?> createTestUser(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        if (phone == null || phone.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "phone is required"));
        }
        if (userRepo.findByPhone(phone).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "A user with this phone number already exists"));
        }
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setName(body.getOrDefault("name", "Test User"));
        user.setPhone(phone);
        user.setEmail(body.get("email"));
        user.setCity(body.get("city"));
        user.setStateName(body.get("stateName"));
        user.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.ok(userRepo.save(user));
    }

    @PatchMapping("/users/{id}/block")
    public ResponseEntity<?> blockUser(
            @PathVariable UUID id,
            @RequestBody Map<String, Boolean> body) {
        return userRepo.findById(id)
            .map(user -> {
                user.setBlocked(body.get("blocked"));
                return ResponseEntity.ok(userRepo.save(user));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
