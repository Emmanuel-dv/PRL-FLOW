package com.prl.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateDocumentTypeRequest {

    @NotBlank
    private String name;

    private Integer validityDays;

    private boolean requiresExpiry;
}
