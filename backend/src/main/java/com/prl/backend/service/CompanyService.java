package com.prl.backend.service;

import com.prl.backend.dto.request.CreateCompanyRequest;
import com.prl.backend.dto.response.CompanyResponse;

import java.util.List;

public interface CompanyService {

    CompanyResponse create(CreateCompanyRequest request);

    CompanyResponse getById(Long id);

    List<CompanyResponse> getAll();

    CompanyResponse update(Long id, CreateCompanyRequest request);

    void deactivate(Long id);
}
