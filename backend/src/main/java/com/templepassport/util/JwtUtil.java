package com.templepassport.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    private static final long EXPIRY_MS = 30L * 24 * 60 * 60 * 1000; // 30 days

    private static final long ADMIN_EXPIRY_MS = 8L * 60 * 60 * 1000; // 8 hours

    public String generateToken(UUID userId, String phone) {
        return Jwts.builder()
                .subject(userId.toString())
                .claim("phone", phone)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRY_MS))
                .signWith(key())
                .compact();
    }

    public String generateAdminToken(String username) {
        return Jwts.builder()
                .subject("admin:" + username)
                .claim("role", "ADMIN")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ADMIN_EXPIRY_MS))
                .signWith(key())
                .compact();
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(claims(token).getSubject());
    }

    public String extractAdminUsername(String token) {
        String subject = claims(token).getSubject();
        return subject.startsWith("admin:") ? subject.substring(6) : subject;
    }

    public boolean isValid(String token) {
        try {
            claims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isValidAdminToken(String token) {
        try {
            Claims c = claims(token);
            return "ADMIN".equals(c.get("role", String.class))
                    && c.getSubject() != null
                    && c.getSubject().startsWith("admin:");
        } catch (Exception e) {
            return false;
        }
    }

    private Claims claims(String token) {
        return Jwts.parser().verifyWith(key()).build()
                .parseSignedClaims(token).getPayload();
    }

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
