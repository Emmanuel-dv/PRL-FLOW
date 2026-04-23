package com.prl.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentStatusLogResponse {

    private Long id;
    private Long changedById;
    private String changedByName;
    private String oldStatus;
    private String newStatus;
    private String comment;
    private LocalDateTime changedAt;
}
