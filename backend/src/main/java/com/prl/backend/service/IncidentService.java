package com.prl.backend.service;

import com.prl.backend.dto.request.CreateIncidentRequest;
import com.prl.backend.dto.request.UpdateIncidentStatusRequest;
import com.prl.backend.dto.response.IncidentResponse;
import com.prl.backend.entity.enums.IncidentStatus;

import java.util.List;

public interface IncidentService {

    IncidentResponse create(CreateIncidentRequest request);

    IncidentResponse getById(Long id);

    List<IncidentResponse> getMyIncidents();

    List<IncidentResponse> getByCompany();

    List<IncidentResponse> getByStatus(IncidentStatus status);

    IncidentResponse updateStatus(Long id, UpdateIncidentStatusRequest request);
}
