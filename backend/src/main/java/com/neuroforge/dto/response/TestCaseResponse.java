package com.neuroforge.dto.response;

import com.neuroforge.entity.TestCase;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCaseResponse {

    private Long testCaseId;
    private Long taskId;
    private String taskTitle;
    private Long sprintId;
    private String sprintName;
    private Long projectId;
    private String projectName;
    private String title;
    private String testType;
    private String steps;
    private String expectedResult;
    private String status;
    private Long executedByUserId;
    private String executedByName;
    private String executedByEmail;
    private LocalDateTime executionDate;
    private LocalDateTime createdAt;

    public static TestCaseResponse fromEntity(TestCase testCase) {
        if (testCase == null) return null;

        return TestCaseResponse.builder()
                .testCaseId(testCase.getTestCaseId())
                .taskId(testCase.getTask() != null ? testCase.getTask().getTaskId() : null)
                .taskTitle(testCase.getTask() != null ? testCase.getTask().getTitle() : null)
                .sprintId(testCase.getTask() != null && testCase.getTask().getSprint() != null 
                        ? testCase.getTask().getSprint().getSprintId() : null)
                .sprintName(testCase.getTask() != null && testCase.getTask().getSprint() != null 
                        ? testCase.getTask().getSprint().getSprintName() : null)
                .projectId(testCase.getTask() != null && testCase.getTask().getSprint() != null && testCase.getTask().getSprint().getProject() != null 
                        ? testCase.getTask().getSprint().getProject().getProjectId() : null)
                .projectName(testCase.getTask() != null && testCase.getTask().getSprint() != null && testCase.getTask().getSprint().getProject() != null 
                        ? testCase.getTask().getSprint().getProject().getName() : null)
                .title(testCase.getTitle())
                .testType(testCase.getTestType())
                .steps(testCase.getSteps())
                .expectedResult(testCase.getExpectedResult())
                .status(testCase.getStatus())
                .executedByUserId(testCase.getExecutedBy() != null ? testCase.getExecutedBy().getUserId() : null)
                .executedByName(testCase.getExecutedBy() != null ? testCase.getExecutedBy().getName() : null)
                .executedByEmail(testCase.getExecutedBy() != null ? testCase.getExecutedBy().getEmail() : null)
                .executionDate(testCase.getExecutionDate())
                .createdAt(testCase.getCreatedAt())
                .build();
    }
}
