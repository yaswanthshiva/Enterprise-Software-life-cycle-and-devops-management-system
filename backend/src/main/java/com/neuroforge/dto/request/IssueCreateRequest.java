package com.neuroforge.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueCreateRequest {

    @NotNull(message = "Task ID is required")
    private Long taskId;

    private Long assignedToUserId; // Optional developer assignee

    @NotBlank(message = "Issue title is required")
    @Size(max = 200, message = "Issue title cannot exceed 200 characters")
    private String title;

    private String description;

    @Builder.Default
    private String severity = "Medium"; // Critical, High, Medium, Low

    @Builder.Default
    private String priority = "Medium"; // High, Medium, Low

    @Builder.Default
    private String status = "Open"; // Open, In Progress, Resolved, Closed, Reopened
}
