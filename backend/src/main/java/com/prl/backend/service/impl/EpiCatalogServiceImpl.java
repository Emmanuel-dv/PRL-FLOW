package com.prl.backend.service.impl;

import com.prl.backend.dto.request.CreateEpiCatalogRequest;
import com.prl.backend.dto.response.EpiCatalogResponse;
import com.prl.backend.entity.EpiCatalog;
import com.prl.backend.mapper.EpiCatalogMapper;
import com.prl.backend.repository.EpiCatalogRepository;
import com.prl.backend.security.SecurityUtils;
import com.prl.backend.service.EpiCatalogService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EpiCatalogServiceImpl implements EpiCatalogService {

    private final EpiCatalogRepository epiCatalogRepository;
    private final EpiCatalogMapper epiCatalogMapper;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public EpiCatalogResponse create(CreateEpiCatalogRequest request) {
        Long companyId = securityUtils.getCurrentCompanyId();

        if (epiCatalogRepository.existsByNameAndCompanyId(request.getName(), companyId)) {
            throw new IllegalArgumentException(
                    "Ya existe un EPI con el nombre: " + request.getName());
        }

        EpiCatalog epiCatalog = EpiCatalog.builder()
                .company(securityUtils.getCurrentUser().getCompany())
                .name(request.getName())
                .referenceCode(request.getReferenceCode())
                .description(request.getDescription())
                .build();

        return epiCatalogMapper.toResponse(epiCatalogRepository.save(epiCatalog));
    }

    @Override
    public EpiCatalogResponse getById(Long id) {
        return epiCatalogMapper.toResponse(findOwnedEpi(id));
    }

    @Override
    public List<EpiCatalogResponse> getAllByCompany() {
        Long companyId = securityUtils.getCurrentCompanyId();
        return epiCatalogMapper.toResponseList(
                epiCatalogRepository.findByCompanyIdAndActiveTrue(companyId));
    }

    @Override
    @Transactional
    public EpiCatalogResponse update(Long id, CreateEpiCatalogRequest request) {
        EpiCatalog epiCatalog = findOwnedEpi(id);
        epiCatalog.setName(request.getName());
        epiCatalog.setReferenceCode(request.getReferenceCode());
        epiCatalog.setDescription(request.getDescription());
        return epiCatalogMapper.toResponse(epiCatalogRepository.save(epiCatalog));
    }

    @Override
    @Transactional
    public void deactivate(Long id) {
        EpiCatalog epiCatalog = findOwnedEpi(id);
        epiCatalog.setActive(false);
        epiCatalogRepository.save(epiCatalog);
    }

    private EpiCatalog findOwnedEpi(Long id) {
        Long companyId = securityUtils.getCurrentCompanyId();
        EpiCatalog epiCatalog = epiCatalogRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("EPI no encontrado: " + id));
        if (!epiCatalog.getCompany().getId().equals(companyId)) {
            throw new IllegalArgumentException("El EPI no pertenece a su empresa.");
        }
        return epiCatalog;
    }
}
