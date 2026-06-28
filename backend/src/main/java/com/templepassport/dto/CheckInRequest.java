package com.templepassport.dto;

import java.time.LocalDate;
import java.util.UUID;

public record CheckInRequest(
        UUID userId,
        UUID templeId,
        LocalDate visitDate,
        Double latitude,
        Double longitude,
        String notes,
        String photoUrl
) {}
