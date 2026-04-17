package com.prl.backend.controller;

import com.prl.backend.dto.request.AssignDocumentReqRequest;
import com.prl.backend.dto.request.AssignEpiReqRequest;
import com.prl.backend.dto.request.CreateJobPositionRequest;
import com.prl.backend.dto.response.JobPositionResponse;
import com.prl.backend.dto.response.PositionDocumentReqResponse;
import com.prl.backend.dto.response.PositionEpiReqResponse;
import com.prl.backend.service.JobPositionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-positions")
@RequiredArgsConstructor
public class JobPositionController {

    private final JobPositionService jobPositionService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<JobPositionResponse> create(
            @Valid @RequestBody CreateJobPositionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobPositionService.create(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<JobPositionResponse>> getAllByCompany() {
        return ResponseEntity.ok(jobPositionService.getAllByCompany());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<JobPositionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(jobPositionService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<JobPositionResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateJobPositionRequest request) {
        return ResponseEntity.ok(jobPositionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        jobPositionService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/documents")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PositionDocumentReqResponse> assignDocument(
            @PathVariable Long id,
            @Valid @RequestBody AssignDocumentReqRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(jobPositionService.assignDocument(id, request));
    }

    @GetMapping("/{id}/documents")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<PositionDocumentReqResponse>> getDocumentRequirements(
            @PathVariable Long id) {
        return ResponseEntity.ok(jobPositionService.getDocumentRequirements(id));
    }

    @PostMapping("/{id}/epis")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PositionEpiReqResponse> assignEpi(
            @PathVariable Long id,
            @Valid @RequestBody AssignEpiReqRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(jobPositionService.assignEpi(id, request));
    }

    @GetMapping("/{id}/epis")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<PositionEpiReqResponse>> getEpiRequirements(
            @PathVariable Long id) {
        return ResponseEntity.ok(jobPositionService.getEpiRequirements(id));
    }
}
