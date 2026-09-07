package com.neuroforge.dto.response;

import com.neuroforge.entity.Sprint;
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
public class SprintResponse {

    private Long sprintId;
    private Long projectId;
    private String projectName;
    private String sprintName;
    private String goal;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long totalTasks;
    private Long completedTasks;
    private LocalDateTime createdAt;

    public static SprintResponse fromEntity(Sprint sprint, Long totalTasks, Long completedTasks) {
        if (sprint == null) return null;

        return SprintResponse.builder()
                .sprintId(sprint.getSprintId())
                .projectId(sprint.getProject() != null ? sprint.getProject().getProjectId() : null)
                .projectName(sprint.getProject() != null ? sprint.getProject().getName() : null)
                .sprintName(sprint.getSprintName())
                .goal(sprint.getGoal())
                .status(sprint.getStatus())
                .startDate(sprint.getStartDate())
                .endDate(sprint.getEndDate())
                .totalTasks(totalTasks != null ? totalTasks : 0L)
                .completedTasks(completedTasks != null ? completedTasks : 0L)
                .createdAt(sprint.getCreatedAt())
                .build();
    }
}
