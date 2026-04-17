package com.prl.backend.service;

import com.prl.backend.dto.request.AssignDocumentReqRequest;
import com.prl.backend.dto.request.AssignEpiReqRequest;
import com.prl.backend.dto.request.CreateJobPositionRequest;
import com.prl.backend.dto.response.JobPositionResponse;
import com.prl.backend.dto.response.PositionDocumentReqResponse;
import com.prl.backend.dto.response.PositionEpiReqResponse;

import java.util.List;

public interface JobPositionService {

    JobPositionResponse create(CreateJobPositionRequest request);

    JobPositionResponse getById(Long id);

    List<JobPositionResponse> getAllByCompany();

    JobPositionResponse update(Long id, CreateJobPositionRequest request);

    void deactivate(Long id);

    PositionDocumentReqResponse assignDocument(Long jobPositionId, AssignDocumentReqRequest request);

    PositionEpiReqResponse assignEpi(Long jobPositionId, AssignEpiReqRequest request);

    List<PositionDocumentReqResponse> getDocumentRequirements(Long jobPositionId);

    List<PositionEpiReqResponse> getEpiRequirements(Long jobPositionId);
}
