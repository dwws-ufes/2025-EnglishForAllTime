package com.backend.dto;

import java.util.List;

public record EnhancedWordDetailsDTO(
    WordDetailsDTO traditionalData,
    List<SemanticResource> linkedData)
{}
