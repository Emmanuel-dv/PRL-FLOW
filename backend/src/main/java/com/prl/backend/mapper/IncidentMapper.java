package com.prl.backend.mapper;

import com.prl.backend.dto.response.IncidentResponse;
import com.prl.backend.entity.Incident;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface IncidentMapper {

    @Mapping(target = "companyId", expression = "java(incident.getCompany().getId())")
    @Mapping(target = "reportedById", expression = "java(incident.getReportedBy().getId())")
    @Mapping(target = "reportedByName", expression = "java(incident.getReportedBy().getName())")
    @Mapping(target = "assignedToId", expression = "java(incident.getAssignedTo() != null ? incident.getAssignedTo().getId() : null)")
    @Mapping(target = "assignedToName", expression = "java(incident.getAssignedTo() != null ? incident.getAssignedTo().getName() : null)")
    @Mapping(target = "type", expression = "java(incident.getType().name())")
    @Mapping(target = "severity", expression = "java(incident.getSeverity().name())")
    @Mapping(target = "status", expression = "java(incident.getStatus().name())")
    @Mapping(target = "statusHistory", ignore = true)
    IncidentResponse toResponse(Incident incident);
}
