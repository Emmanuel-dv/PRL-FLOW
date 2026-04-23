package com.prl.backend.dto.request;

import com.prl.backend.entity.enums.IncidentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateIncidentStatusRequest {

    @NotNull
    private IncidentStatus newStatus;

    private String comment;

    private Long assignedToId;
}
