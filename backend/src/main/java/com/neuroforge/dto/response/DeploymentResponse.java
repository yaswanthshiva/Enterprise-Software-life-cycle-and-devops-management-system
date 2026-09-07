package com.neuroforge.dto.response;

import com.neuroforge.entity.Deployment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeploymentResponse {

    private Long deploymentId;
    private Long projectId;
    private String projectName;
    private Long releaseId;
    private String releaseVersion;
    private String releaseName;
    private Long deployedByUserId;
    private String deployedByName;
    private String environment;
    private String status;
    private LocalDateTime deploymentDate;
    private String notes;
    private LocalDateTime createdAt;

    public static DeploymentResponse fromEntity(Deployment deployment) {
        return DeploymentResponse.builder()
                .deploymentId(deployment.getDeploymentId())
                .projectId(deployment.getProject().getProjectId())
                .projectName(deployment.getProject().getName())
                .releaseId(deployment.getRelease().getReleaseId())
                .releaseVersion(deployment.getRelease().getVersionNumber())
                .releaseName(deployment.getRelease().getReleaseName())
                .deployedByUserId(deployment.getDeployedBy().getUserId())
                .deployedByName(deployment.getDeployedBy().getName())
                .environment(deployment.getEnvironment())
                .status(deployment.getStatus())
                .deploymentDate(deployment.getDeploymentDate())
                .notes(deployment.getNotes())
                .createdAt(deployment.getCreatedAt())
                .build();
    }
}
