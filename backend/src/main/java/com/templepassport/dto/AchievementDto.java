package com.templepassport.dto;

public record AchievementDto(
    String code,
    String name,
    String description,
    String iconName,
    boolean earned,
    String earnedAt
) {}
