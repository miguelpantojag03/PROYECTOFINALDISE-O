package com.motofix.controller;

import com.motofix.dto.AuthRequest;
import com.motofix.dto.AuthResponse;
import com.motofix.dto.UserCreateRequest;
import com.motofix.dto.UserResponse;
import com.motofix.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody UserCreateRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        return authService.login(request);
    }

    @PostMapping("/validate")
    public Map<String, Boolean> validate(@RequestHeader("Authorization") String token) {
        return Map.of("valid", authService.validateToken(token));
    }

    @GetMapping("/me")
    public UserResponse me(Principal principal) {
        return authService.authenticatedUser(principal.getName());
    }
}
