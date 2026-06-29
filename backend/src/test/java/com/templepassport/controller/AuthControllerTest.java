package com.templepassport.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.templepassport.model.OtpSession;
import com.templepassport.model.User;
import com.templepassport.repository.OtpSessionRepository;
import com.templepassport.repository.UserRepository;
import com.templepassport.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean OtpSessionRepository otpRepo;
    @MockBean UserRepository userRepo;
    @MockBean JwtUtil jwtUtil;

    // ── send-otp ─────────────────────────────────────────────────────────────

    @Test
    void sendOtp_withValidPhone_returns200WithNormalizedNumber() throws Exception {
        mockMvc.perform(post("/api/auth/send-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("phone", "9876543210"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("OTP sent to +919876543210"));
    }

    @Test
    void sendOtp_inDevMode_returnsDevCode() throws Exception {
        String body = mockMvc.perform(post("/api/auth/send-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("phone", "9876543210"))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String devCode = objectMapper.readTree(body).get("devCode").asText();
        assertThat(devCode).matches("\\d{6}");
    }

    @Test
    void sendOtp_withInvalidPhone_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/send-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("phone", "123"))))
                .andExpect(status().isBadRequest());
    }

    // ── verify-otp ───────────────────────────────────────────────────────────

    @Test
    void verifyOtp_withCorrectCode_returns200WithToken() throws Exception {
        given(otpRepo.findByPhone("+919876543210")).willReturn(Optional.of(session(0)));
        given(userRepo.findByPhone("+919876543210")).willReturn(Optional.of(user()));
        given(jwtUtil.generateToken(any(), any())).willReturn("mock-token");

        mockMvc.perform(post("/api/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("phone", "9876543210", "code", "123456"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-token"))
                .andExpect(jsonPath("$.isNewUser").value(false));
    }

    @Test
    void verifyOtp_withWrongCode_returns401AndIncrementsAttempts() throws Exception {
        given(otpRepo.findByPhone("+919876543210")).willReturn(Optional.of(session(0)));

        mockMvc.perform(post("/api/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("phone", "9876543210", "code", "000000"))))
                .andExpect(status().isUnauthorized());

        verify(otpRepo).save(any(OtpSession.class));
    }

    @Test
    void verifyOtp_withNoSession_returns401() throws Exception {
        given(otpRepo.findByPhone(any())).willReturn(Optional.empty());

        mockMvc.perform(post("/api/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("phone", "9876543210", "code", "123456"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void verifyOtp_withExpiredSession_returns401() throws Exception {
        OtpSession expired = session(0);
        expired.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        given(otpRepo.findByPhone("+919876543210")).willReturn(Optional.of(expired));

        mockMvc.perform(post("/api/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("phone", "9876543210", "code", "123456"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void verifyOtp_atMaxAttempts_returns429AndDeletesSession() throws Exception {
        OtpSession locked = session(5);
        given(otpRepo.findByPhone("+919876543210")).willReturn(Optional.of(locked));

        mockMvc.perform(post("/api/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("phone", "9876543210", "code", "123456"))))
                .andExpect(status().isTooManyRequests());

        verify(otpRepo).delete(locked);
    }

    @Test
    void verifyOtp_forNewUser_setsIsNewUserTrue() throws Exception {
        given(otpRepo.findByPhone("+919876543210")).willReturn(Optional.of(session(0)));
        given(userRepo.findByPhone("+919876543210")).willReturn(Optional.empty());
        given(userRepo.save(any())).willAnswer(inv -> inv.getArgument(0));
        given(jwtUtil.generateToken(any(), any())).willReturn("mock-token");

        mockMvc.perform(post("/api/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("phone", "9876543210", "code", "123456"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isNewUser").value(true));
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private OtpSession session(int attempts) {
        OtpSession s = new OtpSession();
        s.setPhone("+919876543210");
        s.setCode("123456");
        s.setAttempts(attempts);
        s.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        return s;
    }

    private User user() {
        User u = new User();
        u.setId(UUID.randomUUID());
        u.setPhone("+919876543210");
        u.setName("Test User");
        u.setCreatedAt(LocalDateTime.now());
        return u;
    }
}
