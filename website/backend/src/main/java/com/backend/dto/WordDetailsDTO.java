package com.backend.dto;

import java.util.List;

public record WordDetailsDTO(
        String word,
        String phonetic,
        List<MeaningDTO> meanings,
        String translation
) {}