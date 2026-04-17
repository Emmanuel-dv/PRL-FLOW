package com.prl.backend.mapper;

import com.prl.backend.dto.response.EpiCatalogResponse;
import com.prl.backend.entity.EpiCatalog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EpiCatalogMapper {

    @Mapping(target = "companyId", expression = "java(ec.getCompany().getId())")
    EpiCatalogResponse toResponse(EpiCatalog ec);

    List<EpiCatalogResponse> toResponseList(List<EpiCatalog> list);
}
