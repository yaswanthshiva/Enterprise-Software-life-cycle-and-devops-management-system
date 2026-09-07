package com.neuroforge.dto.request;

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
public class TaskUpdateRequest {

    private Long sprintId;

    private Long storyId;

    private Long assignedToUserId;

    @Size(max = 200, message = "Task title cannot exceed 200 characters")
    private String title;

    private String description;

    private String priority;

    private String status; // To Do, In Progress, In Review, Done

    private LocalDate dueDate;
}
