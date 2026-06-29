package com.templepassport.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.templepassport.repository.UserRepository;
import com.templepassport.service.UserService;
import com.templepassport.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean UserService userService;
    @MockBean UserRepository userRepo;
    @MockBean JwtUtil jwtUtil;

    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID OTHER_ID = UUID.randomUUID();

    // ── authentication ───────────────────────────────────────────────────────

    @Test
    void updateProfile_withNoToken_returns401() throws Exception {
        mockMvc.perform(patch("/api/users/" + USER_ID + "/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "Test"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void updateProfile_withInvalidToken_returns401() throws Exception {
        given(jwtUtil.isValid("bad-token")).willReturn(false);

        mockMvc.perform(patch("/api/users/" + USER_ID + "/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer bad-token")
                        .content(objectMapper.writeValueAsString(Map.of("name", "Test"))))
                .andExpect(status().isUnauthorized());
    }

    // ── authorisation ────────────────────────────────────────────────────────

    @Test
    void updateProfile_withMatchingUser_returns200() throws Exception {
        given(jwtUtil.isValid(any())).willReturn(true);
        given(jwtUtil.extractUserId(any())).willReturn(USER_ID);
        given(userRepo.findById(USER_ID)).willReturn(Optional.of(new com.templepassport.model.User()));

        mockMvc.perform(patch("/api/users/" + USER_ID + "/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer valid-token")
                        .content(objectMapper.writeValueAsString(Map.of("name", "Updated Name"))))
                .andExpect(status().isOk());
    }

    @Test
    void updateProfile_withDifferentUser_returns403() throws Exception {
        given(jwtUtil.isValid(any())).willReturn(true);
        given(jwtUtil.extractUserId(any())).willReturn(OTHER_ID);

        mockMvc.perform(patch("/api/users/" + USER_ID + "/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer valid-token")
                        .content(objectMapper.writeValueAsString(Map.of("name", "Hacker"))))
                .andExpect(status().isForbidden());
    }

    // ── authenticated GET ────────────────────────────────────────────────────

    @Test
    void getStats_withValidToken_returns200() throws Exception {
        given(jwtUtil.isValid(any())).willReturn(true);
        given(jwtUtil.extractUserId(any())).willReturn(USER_ID);
        given(userService.getStats(USER_ID)).willReturn(
                new com.templepassport.dto.UserStatsDto(
                        USER_ID.toString(), "Test", null, 0, 0, 0, 0, List.of(), List.of()));

        mockMvc.perform(get("/api/users/" + USER_ID + "/stats")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk());
    }
}
