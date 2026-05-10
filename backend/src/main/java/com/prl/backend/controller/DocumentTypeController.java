package com.prl.backend.controller;

import com.prl.backend.dto.request.CreateDocumentTypeRequest;
import com.prl.backend.dto.response.DocumentTypeResponse;
import com.prl.backend.service.DocumentTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/document-types")
@RequiredArgsConstructor
public class DocumentTypeController {

    private final DocumentTypeService documentTypeService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DocumentTypeResponse> create(
            @Valid @RequestBody CreateDocumentTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(documentTypeService.create(request));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DocumentTypeResponse>> getAllByCompany() {
        return ResponseEntity.ok(documentTypeService.getAllByCompany());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DocumentTypeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(documentTypeService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DocumentTypeResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateDocumentTypeRequest request) {
        return ResponseEntity.ok(documentTypeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        documentTypeService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
