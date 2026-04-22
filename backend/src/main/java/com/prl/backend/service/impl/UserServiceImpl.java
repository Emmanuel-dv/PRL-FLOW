package com.prl.backend.service.impl;

import com.prl.backend.dto.request.CreateUserRequest;
import com.prl.backend.dto.request.UpdateUserRequest;
import com.prl.backend.dto.response.UserResponse;
import com.prl.backend.entity.Company;
import com.prl.backend.entity.JobPosition;
import com.prl.backend.entity.User;
import com.prl.backend.entity.enums.Role;
import com.prl.backend.mapper.UserMapper;
import com.prl.backend.repository.CompanyRepository;
import com.prl.backend.repository.JobPositionRepository;
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
    private final JobPositionRepository jobPositionRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    public UserResponse create(CreateUserRequest request, Long companyId) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email ya registrado: " + request.getEmail());
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new EntityNotFoundException("Empresa no encontrada con id: " + companyId));

        User.UserBuilder builder = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .company(company)
                .active(true);

        if (request.getManagerId() != null) {
            User manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new EntityNotFoundException("Manager no encontrado"));
            builder.manager(manager);
        }

        if (request.getJobPositionId() != null) {
            JobPosition jobPosition = jobPositionRepository.findById(request.getJobPositionId())
                    .orElseThrow(() -> new EntityNotFoundException("Puesto no encontrado"));
            builder.jobPosition(jobPosition);
        }

        return userMapper.toResponse(userRepository.save(builder.build()));
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
        return userMapper.toResponseList(userRepository.findByCompany_IdAndRole(companyId, role));
    }

    @Override
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + id));

        user.setName(request.getName());
        user.setRole(request.getRole());
        user.setActive(request.isActive());

        if (request.getManagerId() != null) {
            User manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new EntityNotFoundException("Manager no encontrado"));
            user.setManager(manager);
        } else {
            user.setManager(null);
        }

        if (request.getJobPositionId() != null) {
            JobPosition jobPosition = jobPositionRepository.findById(request.getJobPositionId())
                    .orElseThrow(() -> new EntityNotFoundException("Puesto no encontrado"));
            user.setJobPosition(jobPosition);
        } else {
            user.setJobPosition(null);
        }

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public void deactivate(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + id));
        user.setActive(false);
        user.setEmail(user.getEmail() + "_deleted_" + System.currentTimeMillis());
        userRepository.save(user);
    }
}
