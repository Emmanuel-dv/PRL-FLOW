package com.prl.backend.service;

import com.prl.backend.dto.request.LoginRequest;
import com.prl.backend.dto.request.RegisterRequest;
import com.prl.backend.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    AuthResponse register(RegisterRequest request);

    AuthResponse refreshToken(String refreshToken);
}
