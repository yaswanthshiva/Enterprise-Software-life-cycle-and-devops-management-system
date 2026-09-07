package com.neuroforge.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskCreateRequest {

    @NotNull(message = "Sprint ID is required")
    private Long sprintId;

    private Long storyId; // Optional link to UserStory

    @NotNull(message = "Assigned user ID is required")
    private Long assignedToUserId;

    @NotBlank(message = "Task title is required")
    @Size(max = 200, message = "Task title cannot exceed 200 characters")
    private String title;

    private String description;

    @Builder.Default
    private String priority = "Medium";

    @Builder.Default
    private String status = "To Do"; // To Do, In Progress, In Review, Done

    private LocalDate dueDate;
}
