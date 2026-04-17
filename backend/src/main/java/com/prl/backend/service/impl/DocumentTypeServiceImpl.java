package com.prl.backend.service.impl;

import com.prl.backend.dto.request.CreateDocumentTypeRequest;
import com.prl.backend.dto.response.DocumentTypeResponse;
import com.prl.backend.entity.DocumentType;
import com.prl.backend.mapper.DocumentTypeMapper;
import com.prl.backend.repository.DocumentTypeRepository;
import com.prl.backend.security.SecurityUtils;
import com.prl.backend.service.DocumentTypeService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentTypeServiceImpl implements DocumentTypeService {

    private final DocumentTypeRepository documentTypeRepository;
    private final DocumentTypeMapper documentTypeMapper;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public DocumentTypeResponse create(CreateDocumentTypeRequest request) {
        Long companyId = securityUtils.getCurrentCompanyId();

        if (documentTypeRepository.existsByNameAndCompanyId(request.getName(), companyId)) {
            throw new IllegalArgumentException(
                    "Ya existe un tipo de documento con el nombre: " + request.getName());
        }

        DocumentType documentType = DocumentType.builder()
                .company(securityUtils.getCurrentUser().getCompany())
                .name(request.getName())
                .validityDays(request.getValidityDays())
                .requiresExpiry(request.isRequiresExpiry())
                .build();

        return documentTypeMapper.toResponse(documentTypeRepository.save(documentType));
    }

    @Override
    public DocumentTypeResponse getById(Long id) {
        return documentTypeMapper.toResponse(findOwnedDocumentType(id));
    }

    @Override
    public List<DocumentTypeResponse> getAllByCompany() {
        Long companyId = securityUtils.getCurrentCompanyId();
        return documentTypeMapper.toResponseList(
                documentTypeRepository.findByCompanyIdAndActiveTrue(companyId));
    }

    @Override
    @Transactional
    public DocumentTypeResponse update(Long id, CreateDocumentTypeRequest request) {
        DocumentType documentType = findOwnedDocumentType(id);
        documentType.setName(request.getName());
        documentType.setValidityDays(request.getValidityDays());
        documentType.setRequiresExpiry(request.isRequiresExpiry());
        return documentTypeMapper.toResponse(documentTypeRepository.save(documentType));
    }

    @Override
    @Transactional
    public void deactivate(Long id) {
        DocumentType documentType = findOwnedDocumentType(id);
        documentType.setActive(false);
        documentTypeRepository.save(documentType);
    }

    private DocumentType findOwnedDocumentType(Long id) {
        Long companyId = securityUtils.getCurrentCompanyId();
        DocumentType documentType = documentTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Tipo de documento no encontrado: " + id));
        if (!documentType.getCompany().getId().equals(companyId)) {
            throw new IllegalArgumentException("El tipo de documento no pertenece a su empresa.");
        }
        return documentType;
    }
}
