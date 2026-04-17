package com.prl.backend.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerDocumentResponse {

    private Long id;
    private Long workerId;
    private String workerName;
    private Long documentTypeId;
    private String documentTypeName;
    private boolean documentTypeMandatory;
    private Long fileMetadataId;
    private String originalFilename;
    private String downloadUrl;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String status;
    private String rejectionReason;
    private Long reviewedById;
    private String reviewedByName;
    private LocalDateTime uploadedAt;
    private LocalDateTime reviewedAt;
    private boolean expiringSoon;
}
