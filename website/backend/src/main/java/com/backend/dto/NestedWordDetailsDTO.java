package com.backend.dto;

public record NestedWordDetailsDTO(
        WordDetailsDTO mainWord,
        WordDetailsDTO nestedSynonym
) {}
