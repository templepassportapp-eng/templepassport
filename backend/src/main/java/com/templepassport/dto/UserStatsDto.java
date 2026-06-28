package com.templepassport.dto;

import java.util.List;

public record UserStatsDto(
    String userId,
    String name,
    String email,
    int templesVisited,
    int verifiedVisits,
    int statesCovered,
    int totalStates,
    List<CollectionProgressDto> collections,
    List<AchievementDto> achievements
) {}
