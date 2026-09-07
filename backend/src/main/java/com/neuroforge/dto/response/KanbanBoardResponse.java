package com.neuroforge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KanbanBoardResponse {

    private Long sprintId;
    private String sprintName;
    private String sprintStatus;
    private Long totalTasks;

    @Builder.Default
    private List<TaskResponse> todoTasks = new ArrayList<>();

    @Builder.Default
    private List<TaskResponse> inProgressTasks = new ArrayList<>();

    @Builder.Default
    private List<TaskResponse> inReviewTasks = new ArrayList<>();

    @Builder.Default
    private List<TaskResponse> doneTasks = new ArrayList<>();
}
