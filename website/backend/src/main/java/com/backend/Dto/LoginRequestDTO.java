package com.backend.Dto;

import lombok.Data;

@Data
public class LoginRequestDTO {
    private String email;
    private String password;
}

