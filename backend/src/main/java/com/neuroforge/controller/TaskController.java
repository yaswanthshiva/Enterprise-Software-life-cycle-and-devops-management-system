package com.neuroforge.controller;

import com.neuroforge.dto.request.TaskCreateRequest;
import com.neuroforge.dto.request.TaskUpdateRequest;
import com.neuroforge.dto.response.ApiResponse;
import com.neuroforge.dto.response.TaskResponse;
import com.neuroforge.security.UserDetailsImpl;
import com.neuroforge.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping("/tasks")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_BUSINESS_ANALYST')")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(@Valid @RequestBody TaskCreateRequest request) {
        TaskResponse response = taskService.createTask(request);
        return new ResponseEntity<>(
                ApiResponse.success("Task created successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/sprints/{sprintId}/tasks")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasksBySprint(
            @PathVariable Long sprintId,
            @RequestParam(required = false) String status) {
        List<TaskResponse> response = taskService.getTasksBySprint(sprintId, status);
        return ResponseEntity.ok(ApiResponse.success("Sprint tasks retrieved successfully", response));
    }

    @GetMapping("/user-stories/{storyId}/tasks")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasksByStory(@PathVariable Long storyId) {
        List<TaskResponse> response = taskService.getTasksByStory(storyId);
        return ResponseEntity.ok(ApiResponse.success("User story tasks retrieved successfully", response));
    }

    @GetMapping("/tasks/my-tasks")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getMyTasks(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestParam(required = false) String status) {
        List<TaskResponse> response = taskService.getMyTasks(currentUser.getUserId(), status);
        return ResponseEntity.ok(ApiResponse.success("Assigned tasks retrieved successfully", response));
    }

    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(@PathVariable Long taskId) {
        TaskResponse response = taskService.getTaskById(taskId);
        return ResponseEntity.ok(ApiResponse.success("Task retrieved successfully", response));
    }

    @PutMapping("/tasks/{taskId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_DEVELOPER')")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable Long taskId,
            @Valid @RequestBody TaskUpdateRequest request) {
        TaskResponse response = taskService.updateTask(taskId, request);
        return ResponseEntity.ok(ApiResponse.success("Task updated successfully", response));
    }

    @PatchMapping("/tasks/{taskId}/status")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTaskStatus(
            @PathVariable Long taskId,
            @RequestBody Map<String, String> statusMap) {
        String status = statusMap.getOrDefault("status", "To Do");
        TaskResponse response = taskService.updateTaskStatus(taskId, status);
        return ResponseEntity.ok(ApiResponse.success("Task status updated successfully", response));
    }

    @PatchMapping("/tasks/{taskId}/assign")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<TaskResponse>> assignTask(
            @PathVariable Long taskId,
            @RequestBody Map<String, Long> assignMap) {
        Long newAssigneeId = assignMap.get("userId");
        TaskResponse response = taskService.assignTask(taskId, newAssigneeId);
        return ResponseEntity.ok(ApiResponse.success("Task assigned successfully", response));
    }

    @DeleteMapping("/tasks/{taskId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully", null));
    }
}
