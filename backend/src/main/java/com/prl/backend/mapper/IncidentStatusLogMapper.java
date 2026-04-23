package com.prl.backend.mapper;

import com.prl.backend.dto.response.IncidentStatusLogResponse;
import com.prl.backend.entity.IncidentStatusLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface IncidentStatusLogMapper {

    @Mapping(target = "changedById", expression = "java(log.getChangedBy().getId())")
    @Mapping(target = "changedByName", expression = "java(log.getChangedBy().getName())")
    @Mapping(target = "oldStatus", expression = "java(log.getOldStatus() != null ? log.getOldStatus().name() : null)")
    @Mapping(target = "newStatus", expression = "java(log.getNewStatus().name())")
    IncidentStatusLogResponse toResponse(IncidentStatusLog log);

    List<IncidentStatusLogResponse> toResponseList(List<IncidentStatusLog> logs);
}
