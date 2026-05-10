package com.prl.backend.controller;

import com.prl.backend.dto.request.CreateEpiCatalogRequest;
import com.prl.backend.dto.response.EpiCatalogResponse;
import com.prl.backend.service.EpiCatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/epi-catalog")
@RequiredArgsConstructor
public class EpiCatalogController {

    private final EpiCatalogService epiCatalogService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EpiCatalogResponse> create(
            @Valid @RequestBody CreateEpiCatalogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(epiCatalogService.create(request));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EpiCatalogResponse>> getAllByCompany() {
        return ResponseEntity.ok(epiCatalogService.getAllByCompany());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EpiCatalogResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(epiCatalogService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EpiCatalogResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateEpiCatalogRequest request) {
        return ResponseEntity.ok(epiCatalogService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        epiCatalogService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
