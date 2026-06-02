package com.motofix.service;

import com.motofix.dto.UserCreateRequest;
import com.motofix.dto.UserResponse;
import com.motofix.dto.UserUpdateRequest;
import com.motofix.model.RoleName;

import java.util.List;

public interface UserService {
    UserResponse create(UserCreateRequest request);
    List<UserResponse> findAll();
    UserResponse findById(Long id);
    UserResponse update(Long id, UserUpdateRequest request);
    void delete(Long id);
    UserResponse assignRole(Long id, RoleName roleName);
}
