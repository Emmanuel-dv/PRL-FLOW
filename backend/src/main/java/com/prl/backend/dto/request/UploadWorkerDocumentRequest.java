package com.prl.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadWorkerDocumentRequest {

    @NotNull
    private Long documentTypeId;

    private LocalDate issueDate;

    private LocalDate expiryDate;
}
