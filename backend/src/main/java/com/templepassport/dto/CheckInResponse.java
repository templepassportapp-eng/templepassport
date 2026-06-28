package com.templepassport.dto;

import com.templepassport.model.CheckIn;
import com.templepassport.model.VerificationType;

import java.time.LocalDate;
import java.util.UUID;

public record CheckInResponse(
        UUID id,
        UUID userId,
        UUID templeId,
        LocalDate visitDate,
        VerificationType verificationType,
        Double latitude,
        Double longitude,
        String notes,
        String photoUrl
) {
    public static CheckInResponse from(CheckIn c) {
        return new CheckInResponse(
                c.getId(),
                c.getUser().getId(),
                c.getTemple().getId(),
                c.getVisitDate(),
                c.getVerificationType(),
                c.getLatitude(),
                c.getLongitude(),
                c.getNotes(),
                c.getPhotoUrl()
        );
    }
}
