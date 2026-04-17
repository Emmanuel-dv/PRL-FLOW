package com.prl.backend.mapper;

import com.prl.backend.dto.response.PositionDocumentReqResponse;
import com.prl.backend.entity.PositionDocumentReq;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PositionDocumentReqMapper {

    @Mapping(target = "jobPositionId",   expression = "java(req.getJobPosition().getId())")
    @Mapping(target = "jobPositionName", expression = "java(req.getJobPosition().getName())")
    @Mapping(target = "documentTypeId",  expression = "java(req.getDocumentType().getId())")
    @Mapping(target = "documentTypeName",expression = "java(req.getDocumentType().getName())")
    PositionDocumentReqResponse toResponse(PositionDocumentReq req);

    List<PositionDocumentReqResponse> toResponseList(List<PositionDocumentReq> list);
}
