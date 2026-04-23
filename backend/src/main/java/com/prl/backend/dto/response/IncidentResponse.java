package com.prl.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentResponse {

    private Long id;
    private Long companyId;
    private Long reportedById;
    private String reportedByName;
    private Long assignedToId;
    private String assignedToName;
    private String title;
    private String description;
    private String type;
    private String severity;
    private String status;
    private String location;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private List<IncidentStatusLogResponse> statusHistory;
}
