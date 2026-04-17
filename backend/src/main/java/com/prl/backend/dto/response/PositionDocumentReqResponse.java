package com.prl.backend.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PositionDocumentReqResponse {

    private Long id;
    private Long jobPositionId;
    private String jobPositionName;
    private Long documentTypeId;
    private String documentTypeName;
    private boolean mandatory;
    private boolean active;
}
