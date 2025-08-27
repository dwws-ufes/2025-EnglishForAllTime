package com.backend.dto;

import java.util.List;

public record MeaningDTO(
        String partOfSpeech,
        List<DefinitionDTO> definitions,
        List<String> synonyms
) {}