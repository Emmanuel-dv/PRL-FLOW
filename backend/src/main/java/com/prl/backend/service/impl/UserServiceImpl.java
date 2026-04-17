package com.prl.backend.service.impl;

import com.prl.backend.dto.request.CreateUserRequest;
import com.prl.backend.dto.request.UpdateUserRequest;
import com.prl.backend.dto.response.UserResponse;
import com.prl.backend.entity.Company;
import com.prl.backend.entity.User;
import com.prl.backend.entity.enums.Role;
import com.prl.backend.mapper.UserMapper;
import com.prl.backend.repository.CompanyRepository;
import com.prl.backend.repository.UserRepository;
import com.prl.backend.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    public UserResponse create(CreateUserRequest request, Long companyId) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email ya registrado: " + request.getEmail());
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new EntityNotFoundException("Empresa no encontrada con id: " + companyId));

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .managerId(request.getManagerId())
                .jobPositionId(request.getJobPositionId())
                .company(company)
                .active(true)
                .build();

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + id));
        return userMapper.toResponse(user);
    }

    @Override
    public List<UserResponse> getAllByCompany(Long companyId) {
        return userMapper.toResponseList(userRepository.findByCompanyIdAndActiveTrue(companyId));
    }

    @Override
    public List<UserResponse> getByRole(Long companyId, Role role) {
        return userMapper.toResponseList(userRepository.findByCompanyIdAndRole(companyId, role));
    }

    @Override
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + id));

        user.setName(request.getName());
        user.setRole(request.getRole());
        user.setManagerId(request.getManagerId());
        user.setJobPositionId(request.getJobPositionId());
        user.setActive(request.isActive());

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public void deactivate(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + id));
        user.setActive(false);
        userRepository.save(user);
    }
}
