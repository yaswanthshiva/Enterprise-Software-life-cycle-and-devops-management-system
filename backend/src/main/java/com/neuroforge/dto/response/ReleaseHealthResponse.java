package com.neuroforge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReleaseHealthResponse {

    private Long projectId;
    private String projectName;

    // Release stats
    private long totalReleases;
    private long draftReleases;
    private long inProgressReleases;
    private long completedReleases;
    private long archivedReleases;

    // Deployment stats
    private long totalDeployments;
    private long successfulDeployments;
    private long failedDeployments;
    private long rolledBackDeployments;
    private long inProgressDeployments;

    // Environment-level stats
    private long developmentDeployments;
    private long stagingDeployments;
    private long productionDeployments;

    // Success rate
    private double deploymentSuccessRatePercentage;
}
