package com.neuroforge.controller;

import com.neuroforge.dto.request.ProjectCreateRequest;
import com.neuroforge.dto.request.ProjectUpdateRequest;
import com.neuroforge.dto.response.ApiResponse;
import com.neuroforge.dto.response.ProjectResponse;
import com.neuroforge.security.UserDetailsImpl;
import com.neuroforge.service.ProjectService;
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
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody ProjectCreateRequest request) {
        ProjectResponse response = projectService.createProject(currentUser.getUserId(), request);
        return new ResponseEntity<>(
                ApiResponse.success("Project created successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getAllProjects(
            @RequestParam(required = false) String status) {
        List<ProjectResponse> response = projectService.getAllProjects(status);
        return ResponseEntity.ok(ApiResponse.success("Projects retrieved successfully", response));
    }

    @GetMapping("/my-projects")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getMyProjects(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        List<ProjectResponse> response = projectService.getProjectsByOwner(currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("User projects retrieved successfully", response));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProjectById(@PathVariable Long projectId) {
        ProjectResponse response = projectService.getProjectById(projectId);
        return ResponseEntity.ok(ApiResponse.success("Project retrieved successfully", response));
    }

    @PutMapping("/{projectId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectUpdateRequest request) {
        ProjectResponse response = projectService.updateProject(currentUser, projectId, request);
        return ResponseEntity.ok(ApiResponse.success("Project updated successfully", response));
    }

    @PatchMapping("/{projectId}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProjectStatus(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable Long projectId,
            @RequestBody Map<String, String> statusMap) {
        String status = statusMap.getOrDefault("status", "Active");
        ProjectResponse response = projectService.updateProjectStatus(currentUser, projectId, status);
        return ResponseEntity.ok(ApiResponse.success("Project status updated successfully", response));
    }

    @DeleteMapping("/{projectId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable Long projectId) {
        projectService.deleteProject(currentUser, projectId);
        return ResponseEntity.ok(ApiResponse.success("Project archived successfully", null));
    }
}
