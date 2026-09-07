package com.neuroforge.dto.response;

import com.neuroforge.entity.Task;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResponse {

    private Long taskId;
    private Long sprintId;
    private String sprintName;
    private Long projectId;
    private String projectName;
    private Long storyId;
    private String storyTitle;
    private Long assignedToUserId;
    private String assignedToName;
    private String assignedToEmail;
    private String assignedToRole;
    private String title;
    private String description;
    private String priority;
    private String status;
    private LocalDate dueDate;
    private LocalDateTime createdAt;

    public static TaskResponse fromEntity(Task task) {
        if (task == null) return null;

        return TaskResponse.builder()
                .taskId(task.getTaskId())
                .sprintId(task.getSprint() != null ? task.getSprint().getSprintId() : null)
                .sprintName(task.getSprint() != null ? task.getSprint().getSprintName() : null)
                .projectId(task.getSprint() != null && task.getSprint().getProject() != null 
                        ? task.getSprint().getProject().getProjectId() : null)
                .projectName(task.getSprint() != null && task.getSprint().getProject() != null 
                        ? task.getSprint().getProject().getName() : null)
                .storyId(task.getStory() != null ? task.getStory().getStoryId() : null)
                .storyTitle(task.getStory() != null ? task.getStory().getStoryTitle() : null)
                .assignedToUserId(task.getAssignedTo() != null ? task.getAssignedTo().getUserId() : null)
                .assignedToName(task.getAssignedTo() != null ? task.getAssignedTo().getName() : null)
                .assignedToEmail(task.getAssignedTo() != null ? task.getAssignedTo().getEmail() : null)
                .assignedToRole(task.getAssignedTo() != null ? task.getAssignedTo().getRole() : null)
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .status(task.getStatus())
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .build();
    }
}
