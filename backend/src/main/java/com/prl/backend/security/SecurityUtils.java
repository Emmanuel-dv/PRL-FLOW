package com.prl.backend.security;

import com.prl.backend.entity.User;
import com.prl.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Usuario autenticado no encontrado: " + authentication.getName()));
    }

    public Long getCurrentCompanyId() {
        return getCurrentUser().getCompany().getId();
    }
}
