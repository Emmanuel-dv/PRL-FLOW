package com.prl.backend.dto.request;

import com.prl.backend.entity.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRequest {

    @NotBlank
    private String name;

    @NotNull
    private Role role;

    private Long managerId;

    private Long jobPositionId;

    private boolean active;
}
