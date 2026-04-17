package com.prl.backend.controller;

import com.prl.backend.dto.request.CreateEpiDeliveryRequest;
import com.prl.backend.dto.response.EpiDeliveryResponse;
import com.prl.backend.service.EpiDeliveryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/epi-deliveries")
@RequiredArgsConstructor
public class EpiDeliveryController {

    private final EpiDeliveryService epiDeliveryService;

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<EpiDeliveryResponse> create(
            @Valid @RequestBody CreateEpiDeliveryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(epiDeliveryService.create(request));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EpiDeliveryResponse>> getMyDeliveries() {
        return ResponseEntity.ok(epiDeliveryService.getMyDeliveries());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EpiDeliveryResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(epiDeliveryService.getById(id));
    }

    @GetMapping("/company")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EpiDeliveryResponse>> getByCompany() {
        return ResponseEntity.ok(epiDeliveryService.getByCompany());
    }

    @GetMapping("/worker/{workerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<EpiDeliveryResponse>> getByWorker(
            @PathVariable Long workerId) {
        return ResponseEntity.ok(epiDeliveryService.getByWorker(workerId));
    }

    @PutMapping("/{id}/deliver")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<EpiDeliveryResponse> markAsDelivered(@PathVariable Long id) {
        return ResponseEntity.ok(epiDeliveryService.markAsDelivered(id));
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<EpiDeliveryResponse> confirmReception(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(epiDeliveryService.confirmReception(id, httpRequest));
    }
}
