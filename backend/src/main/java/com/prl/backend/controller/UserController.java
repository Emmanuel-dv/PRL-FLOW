package com.prl.backend.controller;

import com.prl.backend.dto.request.CreateUserRequest;
import com.prl.backend.dto.request.UpdateUserRequest;
import com.prl.backend.dto.response.UserResponse;
import com.prl.backend.entity.User;
import com.prl.backend.entity.enums.Role;
import com.prl.backend.repository.UserRepository;
import com.prl.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> create(
            @Valid @RequestBody CreateUserRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long companyId = resolveCompanyId(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request, companyId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<UserResponse>> getAllByCompany(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long companyId = resolveCompanyId(userDetails);
        return ResponseEntity.ok(userService.getAllByCompany(companyId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getByRole(
            @PathVariable Role role,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long companyId = resolveCompanyId(userDetails);
        return ResponseEntity.ok(userService.getByRole(companyId, role));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        userService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    private Long resolveCompanyId(UserDetails userDetails) {
        User user = userRepository.findByEmailAndActiveTrue(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado"));
        return user.getCompany().getId();
    }
}
