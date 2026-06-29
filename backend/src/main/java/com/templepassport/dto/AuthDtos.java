package com.templepassport.dto;

import java.util.UUID;

public class AuthDtos {

    public record SendOtpRequest(String phone) {}

    public record SendOtpResponse(String message, String devCode) {}

    public record VerifyOtpRequest(String phone, String code) {}

    public record VerifyOtpResponse(
            String token,
            UUID userId,
            String phone,
            String name,
            boolean isNewUser
    ) {}

    public record FirebaseVerifyRequest(String idToken) {}
}
