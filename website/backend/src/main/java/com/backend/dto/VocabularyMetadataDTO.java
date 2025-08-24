package com.backend.dto;

public record VocabularyMetadataDTO(
        String namespace,
        String resourceBase,
        int totalCourses,
        int totalModules,
        int totalWords,
        String lastGenerated
) {}