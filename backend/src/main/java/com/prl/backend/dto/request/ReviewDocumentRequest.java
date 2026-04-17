package com.prl.backend.dto.request;

import com.prl.backend.entity.enums.DocumentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDocumentRequest {

    @NotNull
    private DocumentStatus status;

    private String rejectionReason;
}
