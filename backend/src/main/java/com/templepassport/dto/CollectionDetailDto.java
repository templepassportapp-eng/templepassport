package com.templepassport.dto;

import java.util.List;

public record CollectionDetailDto(
    String id,
    String name,
    String description,
    String type,
    int visited,
    int total,
    List<CollectionTempleDto> temples
) {
    public record CollectionTempleDto(
        String id,
        String name,
        String state,
        String imageUrl,
        boolean visited
    ) {}
}
