package com.neuroforge.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeploymentCreateRequest {

    @NotNull(message = "Release ID is required")
    private Long releaseId;

    @NotBlank(message = "Environment is required (Development, Staging, Production)")
    private String environment;

    @Builder.Default
    private String status = "In Progress";

    private LocalDateTime deploymentDate;

    private String notes;
}
