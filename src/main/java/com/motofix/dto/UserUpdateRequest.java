package com.motofix.dto;

import jakarta.validation.constraints.Email;

public record UserUpdateRequest(
        String name,
        @Email String email,
        String phone,
        String address,
        String specialty,
        Boolean available
) {
}
