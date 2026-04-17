package com.prl.backend.mapper;

import com.prl.backend.dto.response.PositionEpiReqResponse;
import com.prl.backend.entity.PositionEpiReq;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PositionEpiReqMapper {

    @Mapping(target = "jobPositionId",  expression = "java(req.getJobPosition().getId())")
    @Mapping(target = "jobPositionName",expression = "java(req.getJobPosition().getName())")
    @Mapping(target = "epiCatalogId",   expression = "java(req.getEpiCatalog().getId())")
    @Mapping(target = "epiCatalogName", expression = "java(req.getEpiCatalog().getName())")
    PositionEpiReqResponse toResponse(PositionEpiReq req);

    List<PositionEpiReqResponse> toResponseList(List<PositionEpiReq> list);
}
