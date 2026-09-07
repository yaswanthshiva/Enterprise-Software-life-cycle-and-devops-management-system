package com.neuroforge.controller;

import com.neuroforge.dto.request.SprintCreateRequest;
import com.neuroforge.dto.request.SprintUpdateRequest;
import com.neuroforge.dto.response.ApiResponse;
import com.neuroforge.dto.response.KanbanBoardResponse;
import com.neuroforge.dto.response.SprintResponse;
import com.neuroforge.service.SprintService;
import com.neuroforge.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SprintController {

    private final SprintService sprintService;
    private final TaskService taskService;

    @PostMapping("/projects/{projectId}/sprints")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<SprintResponse>> createSprint(
            @PathVariable Long projectId,
            @Valid @RequestBody SprintCreateRequest request) {
        SprintResponse response = sprintService.createSprint(projectId, request);
        return new ResponseEntity<>(
                ApiResponse.success("Sprint created successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/projects/{projectId}/sprints")
    public ResponseEntity<ApiResponse<List<SprintResponse>>> getSprintsByProject(
            @PathVariable Long projectId,
            @RequestParam(required = false) String status) {
        List<SprintResponse> response = sprintService.getSprintsByProject(projectId, status);
        return ResponseEntity.ok(ApiResponse.success("Sprints retrieved successfully", response));
    }

    @GetMapping("/projects/{projectId}/sprints/active")
    public ResponseEntity<ApiResponse<SprintResponse>> getActiveSprint(@PathVariable Long projectId) {
        SprintResponse response = sprintService.getActiveSprint(projectId);
        return ResponseEntity.ok(ApiResponse.success("Active sprint retrieved successfully", response));
    }

    @GetMapping("/sprints/{sprintId}")
    public ResponseEntity<ApiResponse<SprintResponse>> getSprintById(@PathVariable Long sprintId) {
        SprintResponse response = sprintService.getSprintById(sprintId);
        return ResponseEntity.ok(ApiResponse.success("Sprint retrieved successfully", response));
    }

    @PutMapping("/sprints/{sprintId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<SprintResponse>> updateSprint(
            @PathVariable Long sprintId,
            @Valid @RequestBody SprintUpdateRequest request) {
        SprintResponse response = sprintService.updateSprint(sprintId, request);
        return ResponseEntity.ok(ApiResponse.success("Sprint updated successfully", response));
    }

    @PatchMapping("/sprints/{sprintId}/start")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<SprintResponse>> startSprint(@PathVariable Long sprintId) {
        SprintResponse response = sprintService.startSprint(sprintId);
        return ResponseEntity.ok(ApiResponse.success("Sprint started successfully (Active)", response));
    }

    @PatchMapping("/sprints/{sprintId}/complete")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<SprintResponse>> completeSprint(@PathVariable Long sprintId) {
        SprintResponse response = sprintService.completeSprint(sprintId);
        return ResponseEntity.ok(ApiResponse.success("Sprint completed successfully", response));
    }

    @GetMapping("/sprints/{sprintId}/kanban")
    public ResponseEntity<ApiResponse<KanbanBoardResponse>> getKanbanBoard(@PathVariable Long sprintId) {
        KanbanBoardResponse response = taskService.getKanbanBoard(sprintId);
        return ResponseEntity.ok(ApiResponse.success("Kanban board data retrieved successfully", response));
    }

    @DeleteMapping("/sprints/{sprintId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteSprint(@PathVariable Long sprintId) {
        sprintService.deleteSprint(sprintId);
        return ResponseEntity.ok(ApiResponse.success("Sprint deleted successfully", null));
    }
}
