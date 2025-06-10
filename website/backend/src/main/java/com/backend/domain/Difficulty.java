package com.backend.domain;

import lombok.Getter;

@Getter
public enum Difficulty {
    BEGINNER("beginner"),
    INTERMEDIATE("intermediate"),
    ADVANCED("advanced");

    private final String level;

    Difficulty(String level) {
        this.level = level;
    }
}