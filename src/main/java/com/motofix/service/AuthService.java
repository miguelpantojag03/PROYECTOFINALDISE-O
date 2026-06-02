package com.motofix.service;

import com.motofix.dto.AuthRequest;
import com.motofix.dto.AuthResponse;
import com.motofix.dto.UserCreateRequest;
import com.motofix.dto.UserResponse;

public interface AuthService {
    AuthResponse register(UserCreateRequest request);
    AuthResponse login(AuthRequest request);
    boolean validateToken(String token);
    UserResponse authenticatedUser(String email);
}
