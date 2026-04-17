package com.prl.backend.service;

import com.prl.backend.dto.request.CreateEpiDeliveryRequest;
import com.prl.backend.dto.response.EpiDeliveryResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface EpiDeliveryService {

    EpiDeliveryResponse create(CreateEpiDeliveryRequest request);

    EpiDeliveryResponse getById(Long id);

    List<EpiDeliveryResponse> getMyDeliveries();

    List<EpiDeliveryResponse> getByWorker(Long workerId);

    List<EpiDeliveryResponse> getByCompany();

    EpiDeliveryResponse markAsDelivered(Long id);

    EpiDeliveryResponse confirmReception(Long id, HttpServletRequest httpRequest);
}
