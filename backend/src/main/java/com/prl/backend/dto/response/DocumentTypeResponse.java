package com.prl.backend.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentTypeResponse {

    private Long id;
    private String name;
    private Integer validityDays;
    private boolean requiresExpiry;
    private boolean active;
    private Long companyId;
}
