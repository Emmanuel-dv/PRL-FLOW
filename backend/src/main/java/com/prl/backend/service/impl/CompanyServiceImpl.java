package com.prl.backend.service.impl;

import com.prl.backend.dto.request.CreateCompanyRequest;
import com.prl.backend.dto.response.CompanyResponse;
import com.prl.backend.entity.Company;
import com.prl.backend.mapper.CompanyMapper;
import com.prl.backend.repository.CompanyRepository;
import com.prl.backend.service.CompanyService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;

    @Override
    public CompanyResponse create(CreateCompanyRequest request) {
        if (companyRepository.existsByCif(request.getCif())) {
            throw new IllegalArgumentException("Ya existe una empresa con el CIF: " + request.getCif());
        }

        Company company = Company.builder()
                .name(request.getName())
                .cif(request.getCif())
                .address(request.getAddress())
                .build();

        return companyMapper.toResponse(companyRepository.save(company));
    }

    @Override
    public CompanyResponse getById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa no encontrada con id: " + id));
        return companyMapper.toResponse(company);
    }

    @Override
    public List<CompanyResponse> getAll() {
        return companyMapper.toResponseList(companyRepository.findByActiveTrue());
    }

    @Override
    public CompanyResponse update(Long id, CreateCompanyRequest request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa no encontrada con id: " + id));

        company.setName(request.getName());
        company.setCif(request.getCif());
        company.setAddress(request.getAddress());

        return companyMapper.toResponse(companyRepository.save(company));
    }

    @Override
    public void deactivate(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa no encontrada con id: " + id));
        company.setActive(false);
        companyRepository.save(company);
    }
}
