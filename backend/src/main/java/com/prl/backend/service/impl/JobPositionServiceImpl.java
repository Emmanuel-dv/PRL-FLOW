package com.prl.backend.service.impl;

import com.prl.backend.dto.request.AssignDocumentReqRequest;
import com.prl.backend.dto.request.AssignEpiReqRequest;
import com.prl.backend.dto.request.CreateJobPositionRequest;
import com.prl.backend.dto.response.JobPositionResponse;
import com.prl.backend.dto.response.PositionDocumentReqResponse;
import com.prl.backend.dto.response.PositionEpiReqResponse;
import com.prl.backend.entity.DocumentType;
import com.prl.backend.entity.EpiCatalog;
import com.prl.backend.entity.JobPosition;
import com.prl.backend.entity.PositionDocumentReq;
import com.prl.backend.entity.PositionEpiReq;
import com.prl.backend.mapper.JobPositionMapper;
import com.prl.backend.mapper.PositionDocumentReqMapper;
import com.prl.backend.mapper.PositionEpiReqMapper;
import com.prl.backend.repository.DocumentTypeRepository;
import com.prl.backend.repository.EpiCatalogRepository;
import com.prl.backend.repository.JobPositionRepository;
import com.prl.backend.repository.PositionDocumentReqRepository;
import com.prl.backend.repository.PositionEpiReqRepository;
import com.prl.backend.security.SecurityUtils;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobPositionServiceImpl implements com.prl.backend.service.JobPositionService {

    private final JobPositionRepository jobPositionRepository;
    private final DocumentTypeRepository documentTypeRepository;
    private final EpiCatalogRepository epiCatalogRepository;
    private final PositionDocumentReqRepository positionDocumentReqRepository;
    private final PositionEpiReqRepository positionEpiReqRepository;
    private final JobPositionMapper jobPositionMapper;
    private final PositionDocumentReqMapper positionDocumentReqMapper;
    private final PositionEpiReqMapper positionEpiReqMapper;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public JobPositionResponse create(CreateJobPositionRequest request) {
        Long companyId = securityUtils.getCurrentCompanyId();

        if (jobPositionRepository.existsByNameAndCompanyId(request.getName(), companyId)) {
            throw new IllegalArgumentException(
                    "Ya existe un puesto con el nombre: " + request.getName());
        }

        JobPosition jobPosition = JobPosition.builder()
                .company(securityUtils.getCurrentUser().getCompany())
                .name(request.getName())
                .description(request.getDescription())
                .build();

        return jobPositionMapper.toResponse(jobPositionRepository.save(jobPosition));
    }

    @Override
    public JobPositionResponse getById(Long id) {
        return jobPositionMapper.toResponse(findOwnedPosition(id));
    }

    @Override
    public List<JobPositionResponse> getAllByCompany() {
        Long companyId = securityUtils.getCurrentCompanyId();
        return jobPositionMapper.toResponseList(
                jobPositionRepository.findByCompanyIdAndActiveTrue(companyId));
    }

    @Override
    @Transactional
    public JobPositionResponse update(Long id, CreateJobPositionRequest request) {
        JobPosition jobPosition = findOwnedPosition(id);
        jobPosition.setName(request.getName());
        jobPosition.setDescription(request.getDescription());
        return jobPositionMapper.toResponse(jobPositionRepository.save(jobPosition));
    }

    @Override
    @Transactional
    public void deactivate(Long id) {
        JobPosition jobPosition = findOwnedPosition(id);
        jobPosition.setActive(false);
        jobPositionRepository.save(jobPosition);
    }

    @Override
    @Transactional
    public PositionDocumentReqResponse assignDocument(Long jobPositionId, AssignDocumentReqRequest request) {
        Long companyId = securityUtils.getCurrentCompanyId();

        JobPosition jobPosition = findOwnedPosition(jobPositionId);

        DocumentType documentType = documentTypeRepository.findById(request.getDocumentTypeId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Tipo de documento no encontrado: " + request.getDocumentTypeId()));

        if (!documentType.getCompany().getId().equals(companyId)) {
            throw new IllegalArgumentException("El tipo de documento no pertenece a su empresa.");
        }

        PositionDocumentReq req = positionDocumentReqRepository
                .findByJobPositionIdAndDocumentTypeId(jobPositionId, request.getDocumentTypeId())
                .map(existing -> {
                    existing.setMandatory(request.isMandatory());
                    existing.setActive(true);
                    return existing;
                })
                .orElseGet(() -> PositionDocumentReq.builder()
                        .jobPosition(jobPosition)
                        .documentType(documentType)
                        .mandatory(request.isMandatory())
                        .build());

        return positionDocumentReqMapper.toResponse(positionDocumentReqRepository.save(req));
    }

    @Override
    @Transactional
    public PositionEpiReqResponse assignEpi(Long jobPositionId, AssignEpiReqRequest request) {
        Long companyId = securityUtils.getCurrentCompanyId();

        JobPosition jobPosition = findOwnedPosition(jobPositionId);

        EpiCatalog epiCatalog = epiCatalogRepository.findById(request.getEpiCatalogId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "EPI no encontrado: " + request.getEpiCatalogId()));

        if (!epiCatalog.getCompany().getId().equals(companyId)) {
            throw new IllegalArgumentException("El EPI no pertenece a su empresa.");
        }

        PositionEpiReq req = positionEpiReqRepository
                .findByJobPositionIdAndEpiCatalogId(jobPositionId, request.getEpiCatalogId())
                .map(existing -> {
                    existing.setQuantity(request.getQuantity());
                    existing.setActive(true);
                    return existing;
                })
                .orElseGet(() -> PositionEpiReq.builder()
                        .jobPosition(jobPosition)
                        .epiCatalog(epiCatalog)
                        .quantity(request.getQuantity())
                        .build());

        return positionEpiReqMapper.toResponse(positionEpiReqRepository.save(req));
    }

    @Override
    public List<PositionDocumentReqResponse> getDocumentRequirements(Long jobPositionId) {
        findOwnedPosition(jobPositionId);
        return positionDocumentReqMapper.toResponseList(
                positionDocumentReqRepository.findByJobPositionIdAndActiveTrue(jobPositionId));
    }

    @Override
    public List<PositionEpiReqResponse> getEpiRequirements(Long jobPositionId) {
        findOwnedPosition(jobPositionId);
        return positionEpiReqMapper.toResponseList(
                positionEpiReqRepository.findByJobPositionIdAndActiveTrue(jobPositionId));
    }

    private JobPosition findOwnedPosition(Long id) {
        Long companyId = securityUtils.getCurrentCompanyId();
        JobPosition jobPosition = jobPositionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Puesto no encontrado: " + id));
        if (!jobPosition.getCompany().getId().equals(companyId)) {
            throw new IllegalArgumentException("El puesto no pertenece a su empresa.");
        }
        return jobPosition;
    }
}
