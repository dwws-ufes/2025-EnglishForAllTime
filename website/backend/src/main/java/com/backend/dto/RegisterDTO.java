package com.backend.dto;

import com.backend.domain.UserRole;

public record RegisterDTO(String login, String password, UserRole role) {
}
