package com.prl.backend.dto.request;

import com.prl.backend.entity.enums.IncidentSeverity;
import com.prl.backend.entity.enums.IncidentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateIncidentRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotNull
    private IncidentType type;

    @NotNull
    private IncidentSeverity severity;

    @NotBlank
    private String location;
}
