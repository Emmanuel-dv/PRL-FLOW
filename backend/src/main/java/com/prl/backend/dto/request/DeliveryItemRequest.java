package com.prl.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryItemRequest {

    @NotNull
    private Long epiCatalogId;

    @NotNull
    @Min(1)
    private Integer quantity;
}
