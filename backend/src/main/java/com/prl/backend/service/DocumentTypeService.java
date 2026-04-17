package com.prl.backend.service;

import com.prl.backend.dto.request.CreateDocumentTypeRequest;
import com.prl.backend.dto.response.DocumentTypeResponse;

import java.util.List;

public interface DocumentTypeService {

    DocumentTypeResponse create(CreateDocumentTypeRequest request);

    DocumentTypeResponse getById(Long id);

    List<DocumentTypeResponse> getAllByCompany();

    DocumentTypeResponse update(Long id, CreateDocumentTypeRequest request);

    void deactivate(Long id);
}
