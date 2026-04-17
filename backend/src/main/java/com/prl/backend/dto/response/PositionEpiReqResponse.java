package com.prl.backend.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PositionEpiReqResponse {

    private Long id;
    private Long jobPositionId;
    private String jobPositionName;
    private Long epiCatalogId;
    private String epiCatalogName;
    private Integer quantity;
    private boolean active;
}
