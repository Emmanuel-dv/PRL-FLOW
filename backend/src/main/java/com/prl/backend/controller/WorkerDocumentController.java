package com.prl.backend.controller;

import com.prl.backend.dto.request.ReviewDocumentRequest;
import com.prl.backend.dto.request.UploadWorkerDocumentRequest;
import com.prl.backend.dto.response.WorkerDocumentResponse;
import com.prl.backend.service.WorkerDocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/worker-documents")
@RequiredArgsConstructor
public class WorkerDocumentController {

    private final WorkerDocumentService workerDocumentService;

    @PostMapping
    @PreAuthorize("hasRole('WORKER') or hasRole('ADMIN')")
    public ResponseEntity<WorkerDocumentResponse> upload(
            @Valid @RequestPart("data") UploadWorkerDocumentRequest request,
            @RequestPart("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workerDocumentService.upload(request, file));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<WorkerDocumentResponse>> getMyDocuments() {
        return ResponseEntity.ok(workerDocumentService.getMyDocuments());
    }

    @GetMapping("/worker/{workerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<WorkerDocumentResponse>> getByWorker(
            @PathVariable Long workerId) {
        return ResponseEntity.ok(workerDocumentService.getByWorker(workerId));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<WorkerDocumentResponse>> getPendingReview() {
        return ResponseEntity.ok(workerDocumentService.getPendingReview());
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WorkerDocumentResponse> review(
            @PathVariable Long id,
            @Valid @RequestBody ReviewDocumentRequest request) {
        return ResponseEntity.ok(workerDocumentService.review(id, request));
    }

    @GetMapping("/worker/{workerId}/compliance")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Map<String, Object>> getComplianceStatus(
            @PathVariable Long workerId) {
        return ResponseEntity.ok(workerDocumentService.getComplianceStatus(workerId));
    }
}
