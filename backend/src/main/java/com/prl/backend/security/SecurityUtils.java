package com.prl.backend.security;

import com.prl.backend.entity.User;
import com.prl.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        log.debug("getCurrentUser() → email from JWT: '{}'", email);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Usuario autenticado no encontrado: " + email));
    }

    public Long getCurrentCompanyId() {
        return getCurrentUser().getCompany().getId();
    }
}
