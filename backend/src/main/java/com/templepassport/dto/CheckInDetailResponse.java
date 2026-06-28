package com.templepassport.dto;

import com.templepassport.model.CheckIn;
import java.time.LocalDate;
import java.util.UUID;

public record CheckInDetailResponse(
    UUID id,
    UUID userId,
    UUID templeId,
    String templeName,
    String templeState,
    String templeCity,
    double templeLatitude,
    double templeLongitude,
    String templeImageUrl,
    LocalDate visitDate,
    String verificationType,
    String notes,
    String photoUrl
) {
    public static CheckInDetailResponse from(CheckIn c) {
        return new CheckInDetailResponse(
            c.getId(),
            c.getUser().getId(),
            c.getTemple().getId(),
            c.getTemple().getName(),
            c.getTemple().getState(),
            c.getTemple().getCity(),
            c.getTemple().getLatitude(),
            c.getTemple().getLongitude(),
            c.getTemple().getImageUrl(),
            c.getVisitDate(),
            c.getVerificationType().name(),
            c.getNotes(),
            c.getPhotoUrl()
        );
    }
}
