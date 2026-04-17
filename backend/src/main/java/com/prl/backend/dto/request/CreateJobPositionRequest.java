package com.prl.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateJobPositionRequest {

    @NotBlank
    private String name;

    private String description;
}
