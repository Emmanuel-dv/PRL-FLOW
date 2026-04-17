package com.prl.backend.mapper;

import com.prl.backend.dto.response.CompanyResponse;
import com.prl.backend.entity.Company;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CompanyMapper {

    CompanyResponse toResponse(Company company);

    List<CompanyResponse> toResponseList(List<Company> companies);
}
