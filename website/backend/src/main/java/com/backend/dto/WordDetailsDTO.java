package com.backend.dto;

public record WordDetailsDTO(
        String word,
        String definition,
        String translation
) {}