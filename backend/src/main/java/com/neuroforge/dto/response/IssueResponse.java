package com.neuroforge.dto.response;

import com.neuroforge.entity.Issue;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueResponse {

    private Long issueId;
    private Long taskId;
    private String taskTitle;
    private Long sprintId;
    private String sprintName;
    private Long projectId;
    private String projectName;
    private Long reportedByUserId;
    private String reportedByName;
    private String reportedByEmail;
    private Long assignedToUserId;
    private String assignedToName;
    private String assignedToEmail;
    private String title;
    private String description;
    private String severity;
    private String priority;
    private String status;
    private LocalDateTime createdAt;

    public static IssueResponse fromEntity(Issue issue) {
        if (issue == null) return null;

        return IssueResponse.builder()
                .issueId(issue.getIssueId())
                .taskId(issue.getTask() != null ? issue.getTask().getTaskId() : null)
                .taskTitle(issue.getTask() != null ? issue.getTask().getTitle() : null)
                .sprintId(issue.getTask() != null && issue.getTask().getSprint() != null 
                        ? issue.getTask().getSprint().getSprintId() : null)
                .sprintName(issue.getTask() != null && issue.getTask().getSprint() != null 
                        ? issue.getTask().getSprint().getSprintName() : null)
                .projectId(issue.getTask() != null && issue.getTask().getSprint() != null && issue.getTask().getSprint().getProject() != null 
                        ? issue.getTask().getSprint().getProject().getProjectId() : null)
                .projectName(issue.getTask() != null && issue.getTask().getSprint() != null && issue.getTask().getSprint().getProject() != null 
                        ? issue.getTask().getSprint().getProject().getName() : null)
                .reportedByUserId(issue.getReportedBy() != null ? issue.getReportedBy().getUserId() : null)
                .reportedByName(issue.getReportedBy() != null ? issue.getReportedBy().getName() : null)
                .reportedByEmail(issue.getReportedBy() != null ? issue.getReportedBy().getEmail() : null)
                .assignedToUserId(issue.getAssignedTo() != null ? issue.getAssignedTo().getUserId() : null)
                .assignedToName(issue.getAssignedTo() != null ? issue.getAssignedTo().getName() : null)
                .assignedToEmail(issue.getAssignedTo() != null ? issue.getAssignedTo().getEmail() : null)
                .title(issue.getTitle())
                .description(issue.getDescription())
                .severity(issue.getSeverity())
                .priority(issue.getPriority())
                .status(issue.getStatus())
                .createdAt(issue.getCreatedAt())
                .build();
    }
}
