package com.prl.backend.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EpiDeliveryResponse {

    private Long id;
    private Long companyId;
    private Long managerId;
    private String managerName;
    private Long workerId;
    private String workerName;
    private String status;
    private LocalDateTime openedAt;
    private LocalDateTime deliveredAt;
    private String notes;
    private List<EpiDeliveryItemResponse> items;
    private EpiDeliveryConfirmResponse confirmation;
}
