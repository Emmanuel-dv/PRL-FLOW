package com.prl.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignDocumentReqRequest {

    @NotNull
    private Long documentTypeId;

    private boolean mandatory;
}
