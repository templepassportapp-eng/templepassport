package com.templepassport.controller;

import com.templepassport.dto.AuthDtos.*;
import com.templepassport.model.OtpSession;
import com.templepassport.model.User;
import com.templepassport.repository.OtpSessionRepository;
import com.templepassport.repository.UserRepository;
import com.templepassport.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    private final OtpSessionRepository otpRepo;
    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;
    private final Random random = new Random();

    public AuthController(OtpSessionRepository otpRepo, UserRepository userRepo, JwtUtil jwtUtil) {
        this.otpRepo = otpRepo;
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<SendOtpResponse> sendOtp(@RequestBody SendOtpRequest req) {
        String phone = normalizePhone(req.phone());
        if (phone == null) {
            return ResponseEntity.badRequest().build();
        }

        // Clean up any existing OTPs for this phone
        otpRepo.deleteByPhone(phone);
        otpRepo.deleteExpired(LocalDateTime.now());

        // Generate 6-digit code
        String code = String.format("%06d", random.nextInt(1_000_000));

        OtpSession session = new OtpSession();
        session.setPhone(phone);
        session.setCode(code);
        session.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        otpRepo.save(session);

        // In dev mode: return the code in the response so it can be used without real SMS
        return ResponseEntity.ok(new SendOtpResponse("OTP sent to " + phone, code));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<VerifyOtpResponse> verifyOtp(@RequestBody VerifyOtpRequest req) {
        String phone = normalizePhone(req.phone());
        if (phone == null) {
            return ResponseEntity.badRequest().build();
        }

        OtpSession session = otpRepo.findByPhoneAndCode(phone, req.code())
                .orElse(null);

        if (session == null || session.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(401).build();
        }

        otpRepo.delete(session);

        // Find or create user
        boolean isNewUser = false;
        User user = userRepo.findByPhone(phone).orElse(null);
        if (user == null) {
            user = new User();
            user.setId(UUID.randomUUID());
            user.setPhone(phone);
            user.setName(phone); // placeholder — user can update profile name later
            user.setCreatedAt(LocalDateTime.now());
            userRepo.save(user);
            isNewUser = true;
        }

        String token = jwtUtil.generateToken(user.getId(), phone);
        return ResponseEntity.ok(new VerifyOtpResponse(token, user.getId(), phone, user.getName(), isNewUser));
    }

    private String normalizePhone(String raw) {
        if (raw == null) return null;
        String digits = raw.replaceAll("[^0-9]", "");
        // Accept 10-digit Indian numbers, optionally with +91 prefix
        if (digits.length() == 10) return "+91" + digits;
        if (digits.length() == 12 && digits.startsWith("91")) return "+" + digits;
        if (digits.length() == 13 && digits.startsWith("91")) return "+" + digits.substring(1);
        return digits.length() >= 10 ? "+" + digits : null;
    }
}
