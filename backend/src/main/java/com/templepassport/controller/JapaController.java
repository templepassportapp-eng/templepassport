package com.templepassport.controller;

import com.templepassport.dto.JapaDtos;
import com.templepassport.service.JapaService;
import com.templepassport.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/japa")
@CrossOrigin
public class JapaController {

    private final JapaService japaService;
    private final JwtUtil jwtUtil;

    public JapaController(JapaService japaService, JwtUtil jwtUtil) {
        this.japaService = japaService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Sync japa data from the Naam Jap offline app into Temple Passport.
     * Called automatically on sign-in and on manual "Sync now" tap.
     */
    @PostMapping("/sync")
    public ResponseEntity<JapaDtos.SyncResponse> sync(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody JapaDtos.SyncRequest req) {

        UUID userId = extractUserId(authHeader);
        if (userId == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(japaService.sync(userId, req));
    }

    /**
     * Get the authenticated user's full japa summary for the Stats screen.
     */
    @GetMapping("/summary")
    public ResponseEntity<JapaDtos.SummaryResponse> summary(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        UUID userId = extractUserId(authHeader);
        if (userId == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(japaService.summary(userId));
    }

    private UUID extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        try {
            return jwtUtil.extractUserId(authHeader.substring(7));
        } catch (Exception e) {
            return null;
        }
    }
}
