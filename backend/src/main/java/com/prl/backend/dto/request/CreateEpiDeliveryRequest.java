package com.prl.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateEpiDeliveryRequest {

    @NotNull
    private Long workerId;

    @NotEmpty
    @Valid
    private List<DeliveryItemRequest> items;

    private String notes;
}
