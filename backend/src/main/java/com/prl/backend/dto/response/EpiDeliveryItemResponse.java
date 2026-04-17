package com.prl.backend.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EpiDeliveryItemResponse {

    private Long id;
    private Long epiCatalogId;
    private String epiCatalogName;
    private String referenceCode;
    private Integer quantity;
}
