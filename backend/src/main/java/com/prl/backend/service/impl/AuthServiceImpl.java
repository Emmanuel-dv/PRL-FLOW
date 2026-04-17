package com.prl.backend.service.impl;

import com.prl.backend.dto.request.LoginRequest;
import com.prl.backend.dto.request.RegisterRequest;
import com.prl.backend.dto.response.AuthResponse;
import com.prl.backend.entity.Company;
import com.prl.backend.entity.User;
import com.prl.backend.mapper.UserMapper;
import com.prl.backend.repository.CompanyRepository;
import com.prl.backend.repository.UserRepository;
import com.prl.backend.security.jwt.JwtUtils;
import com.prl.backend.service.AuthService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final UserMapper userMapper;
    private final UserDetailsService userDetailsService;

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmailAndActiveTrue(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String accessToken = jwtUtils.generateAccessToken(user);
        String refreshToken = jwtUtils.generateRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email ya registrado");
        }

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new EntityNotFoundException("Empresa no encontrada con id: " + request.getCompanyId()));

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .company(company)
                .active(true)
                .build();

        user = userRepository.save(user);

        String accessToken = jwtUtils.generateAccessToken(user);
        String refreshToken = jwtUtils.generateRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        String username = jwtUtils.extractUsername(refreshToken);

        User user = (User) userDetailsService.loadUserByUsername(username);

        if (!jwtUtils.isTokenValid(refreshToken, user)) {
            throw new RuntimeException("Refresh token inválido o expirado");
        }

        String newAccessToken = jwtUtils.generateAccessToken(user);

        return buildAuthResponse(user, newAccessToken, refreshToken);
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .build();
    }
}
