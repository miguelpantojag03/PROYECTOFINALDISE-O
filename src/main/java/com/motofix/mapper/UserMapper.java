package com.motofix.mapper;

import com.motofix.dto.UserResponse;
import com.motofix.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().getName(),
                user.getClass().getSimpleName()
        );
    }
}
