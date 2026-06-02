package com.motofix.service.impl;

import com.motofix.dto.UserCreateRequest;
import com.motofix.dto.UserResponse;
import com.motofix.dto.UserUpdateRequest;
import com.motofix.entity.*;
import com.motofix.exception.BusinessException;
import com.motofix.exception.ResourceNotFoundException;
import com.motofix.mapper.UserMapper;
import com.motofix.model.RoleName;
import com.motofix.repository.RoleRepository;
import com.motofix.repository.UserRepository;
import com.motofix.service.AuditLogService;
import com.motofix.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final AuditLogService auditLogService;

    @Override
    public UserResponse create(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("Email is already registered");
        }
        Role role = roleRepository.findByName(request.role())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
        User user = buildUserByRole(request);
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(role);
        User saved = userRepository.save(user);
        auditLogService.record("USER_CREATED", "User #" + saved.getId() + " created with role " + request.role());
        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream().map(userMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return userMapper.toResponse(getUser(id));
    }

    @Override
    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = getUser(id);
        if (request.name() != null) user.setName(request.name());
        if (request.email() != null) user.setEmail(request.email());
        if (user instanceof Customer customer) {
            if (request.phone() != null) customer.setPhone(request.phone());
            if (request.address() != null) customer.setAddress(request.address());
        }
        if (user instanceof Mechanic mechanic) {
            if (request.specialty() != null) mechanic.setSpecialty(request.specialty());
            if (request.available() != null) mechanic.setAvailable(request.available());
        }
        if (user instanceof Administrator administrator) {
            if (request.phone() != null) administrator.setPhone(request.phone());
            if (request.address() != null) administrator.setAddress(request.address());
        }
        auditLogService.record("USER_UPDATED", "User #" + id + " updated");
        return userMapper.toResponse(user);
    }

    @Override
    public void delete(Long id) {
        userRepository.delete(getUser(id));
        auditLogService.record("USER_DELETED", "User #" + id + " deleted");
    }

    @Override
    public UserResponse assignRole(Long id, RoleName roleName) {
        User user = getUser(id);
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
        user.setRole(role);
        auditLogService.record("USER_ROLE_CHANGED", "User #" + id + " changed to role " + roleName);
        return userMapper.toResponse(user);
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private User buildUserByRole(UserCreateRequest request) {
        return switch (request.role()) {
            case ROLE_CUSTOMER -> {
                Customer customer = new Customer();
                customer.setPhone(request.phone());
                customer.setAddress(request.address());
                yield customer;
            }
            case ROLE_MECHANIC -> {
                Mechanic mechanic = new Mechanic();
                mechanic.setSpecialty(request.specialty());
                mechanic.setAvailable(true);
                yield mechanic;
            }
            case ROLE_ADMINISTRATOR -> {
                Administrator administrator = new Administrator();
                administrator.setPhone(request.phone());
                administrator.setAddress(request.address());
                yield administrator;
            }
        };
    }
}
