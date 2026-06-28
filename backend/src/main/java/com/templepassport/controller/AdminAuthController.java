package com.templepassport.controller;

import com.templepassport.repository.AdminUserRepository;
import com.templepassport.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private final AdminUserRepository adminUserRepo;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();

    public AdminAuthController(AdminUserRepository adminUserRepo, JwtUtil jwtUtil) {
        this.adminUserRepo = adminUserRepo;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "username and password required"));
        }

        return adminUserRepo.findByUsername(username)
            .filter(admin -> bcrypt.matches(password, admin.getPasswordHash()))
            .map(admin -> {
                String token = jwtUtil.generateAdminToken(admin.getUsername());
                return ResponseEntity.ok(Map.of(
                    "token", token,
                    "name", admin.getName() != null ? admin.getName() : admin.getUsername()
                ));
            })
            .orElseGet(() -> ResponseEntity.status(401)
                .body(Map.of("error", "Invalid username or password")));
    }
}
