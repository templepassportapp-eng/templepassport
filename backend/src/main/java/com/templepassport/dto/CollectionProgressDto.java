package com.templepassport.dto;

public record CollectionProgressDto(
    String id,
    String name,
    String type,
    int visited,
    int total
) {}
