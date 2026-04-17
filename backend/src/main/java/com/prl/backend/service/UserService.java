package com.prl.backend.service;

import com.prl.backend.dto.request.CreateUserRequest;
import com.prl.backend.dto.request.UpdateUserRequest;
import com.prl.backend.dto.response.UserResponse;
import com.prl.backend.entity.enums.Role;

import java.util.List;

public interface UserService {

    UserResponse create(CreateUserRequest request, Long companyId);

    UserResponse getById(Long id);

    List<UserResponse> getAllByCompany(Long companyId);

    List<UserResponse> getByRole(Long companyId, Role role);

    UserResponse update(Long id, UpdateUserRequest request);

    void deactivate(Long id);
}
