package com.prl.backend.mapper;

import com.prl.backend.dto.response.DocumentTypeResponse;
import com.prl.backend.entity.DocumentType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DocumentTypeMapper {

    @Mapping(target = "companyId", expression = "java(dt.getCompany().getId())")
    DocumentTypeResponse toResponse(DocumentType dt);

    List<DocumentTypeResponse> toResponseList(List<DocumentType> list);
}
