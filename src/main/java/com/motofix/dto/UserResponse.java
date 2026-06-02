package com.motofix.dto;

import com.motofix.model.RoleName;

public record UserResponse(
        Long id,
        String name,
        String email,
        RoleName role,
        String userType
) {
}
