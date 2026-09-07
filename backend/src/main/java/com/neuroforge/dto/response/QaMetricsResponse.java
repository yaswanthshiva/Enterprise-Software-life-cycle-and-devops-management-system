package com.neuroforge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QaMetricsResponse {

    private Long projectId;
    private String projectName;
    private Long totalTestCases;
    private Long passedTestCases;
    private Long failedTestCases;
    private Long pendingTestCases;
    private Double passRatePercentage;
    private Long totalIssues;
    private Long openIssues;
    private Long criticalIssues;
    private Long resolvedIssues;
}
