package com.motofix.service.impl;

import com.motofix.dto.AuthRequest;
import com.motofix.dto.AuthResponse;
import com.motofix.dto.UserCreateRequest;
import com.motofix.dto.UserResponse;
import com.motofix.entity.User;
import com.motofix.exception.ResourceNotFoundException;
import com.motofix.mapper.UserMapper;
import com.motofix.repository.UserRepository;
import com.motofix.security.JwtService;
import com.motofix.service.AuthService;
import com.motofix.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public AuthResponse register(UserCreateRequest request) {
        UserResponse user = userService.create(request);
        return new AuthResponse(jwtService.generateToken(user.email()), user);
    }

    @Override
    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new AuthResponse(jwtService.generateToken(user.getEmail()), userMapper.toResponse(user));
    }

    @Override
    public boolean validateToken(String token) {
        try {
            String cleanToken = token.replace("Bearer ", "");
            String email = jwtService.extractEmail(cleanToken);
            return jwtService.isValid(cleanToken, email);
        } catch (RuntimeException exception) {
            return false;
        }
    }

    @Override
    public UserResponse authenticatedUser(String email) {
        return userRepository.findByEmail(email)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
