package com.neuroforge.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeploymentStatusUpdateRequest {

    @NotBlank(message = "Status is required (In Progress, Success, Failed, Rolled Back)")
    private String status;

    private String notes;
}
