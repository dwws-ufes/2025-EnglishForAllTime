package com.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record VocabularyMetadataDTO(
        String vocabularyName,
        String description,
        String version,
        String author,
        LocalDateTime lastModified,
        int totalWords,
        int totalDefinitions,
        List<String> categories,
        String license,
        String format
) {}