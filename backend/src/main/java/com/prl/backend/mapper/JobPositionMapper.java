package com.prl.backend.mapper;

import com.prl.backend.dto.response.JobPositionResponse;
import com.prl.backend.entity.JobPosition;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface JobPositionMapper {

    @Mapping(target = "companyId", expression = "java(jp.getCompany().getId())")
    JobPositionResponse toResponse(JobPosition jp);

    List<JobPositionResponse> toResponseList(List<JobPosition> list);
}
