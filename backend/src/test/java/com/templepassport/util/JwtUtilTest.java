package com.templepassport.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private static final String SECRET = "test-secret-key-for-tests-must-be-32chars!!";

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", SECRET);
    }

    @Test
    void generateToken_returnsNonNullString() {
        String token = jwtUtil.generateToken(UUID.randomUUID(), "+919999999999");
        assertThat(token).isNotBlank();
    }

    @Test
    void extractUserId_returnsCorrectId() {
        UUID id = UUID.randomUUID();
        String token = jwtUtil.generateToken(id, "+919999999999");
        assertThat(jwtUtil.extractUserId(token)).isEqualTo(id);
    }

    @Test
    void isValid_withFreshToken_returnsTrue() {
        String token = jwtUtil.generateToken(UUID.randomUUID(), "+919999999999");
        assertThat(jwtUtil.isValid(token)).isTrue();
    }

    @Test
    void isValid_withExpiredToken_returnsFalse() {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        String expired = Jwts.builder()
                .subject(UUID.randomUUID().toString())
                .issuedAt(new Date(System.currentTimeMillis() - 10_000))
                .expiration(new Date(System.currentTimeMillis() - 5_000))
                .signWith(key)
                .compact();
        assertThat(jwtUtil.isValid(expired)).isFalse();
    }

    @Test
    void isValid_withTamperedToken_returnsFalse() {
        String token = jwtUtil.generateToken(UUID.randomUUID(), "+919999999999");
        String tampered = token.substring(0, token.length() - 4) + "XXXX";
        assertThat(jwtUtil.isValid(tampered)).isFalse();
    }

    @Test
    void generateAdminToken_isValidAdminToken() {
        String token = jwtUtil.generateAdminToken("admin");
        assertThat(jwtUtil.isValidAdminToken(token)).isTrue();
    }

    @Test
    void isValidAdminToken_withUserToken_returnsFalse() {
        String userToken = jwtUtil.generateToken(UUID.randomUUID(), "+919999999999");
        assertThat(jwtUtil.isValidAdminToken(userToken)).isFalse();
    }

    @Test
    void extractAdminUsername_returnsCorrectUsername() {
        String token = jwtUtil.generateAdminToken("testadmin");
        assertThat(jwtUtil.extractAdminUsername(token)).isEqualTo("testadmin");
    }
}
