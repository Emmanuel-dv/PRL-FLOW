package com.prl.backend.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EpiDeliveryConfirmResponse {

    private Long id;
    private Long workerId;
    private String workerName;
    private LocalDateTime confirmedAt;
    private String ipAddress;
    private String confirmationHash;
}
