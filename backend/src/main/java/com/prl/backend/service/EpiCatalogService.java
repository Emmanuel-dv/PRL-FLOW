package com.prl.backend.service;

import com.prl.backend.dto.request.CreateEpiCatalogRequest;
import com.prl.backend.dto.response.EpiCatalogResponse;

import java.util.List;

public interface EpiCatalogService {

    EpiCatalogResponse create(CreateEpiCatalogRequest request);

    EpiCatalogResponse getById(Long id);

    List<EpiCatalogResponse> getAllByCompany();

    EpiCatalogResponse update(Long id, CreateEpiCatalogRequest request);

    void deactivate(Long id);
}
