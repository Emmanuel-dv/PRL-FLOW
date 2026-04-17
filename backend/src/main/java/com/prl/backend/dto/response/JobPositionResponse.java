package com.prl.backend.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPositionResponse {

    private Long id;
    private String name;
    private String description;
    private boolean active;
    private Long companyId;
}
