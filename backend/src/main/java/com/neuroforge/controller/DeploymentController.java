package com.neuroforge.controller;

import com.neuroforge.dto.request.DeploymentCreateRequest;
import com.neuroforge.dto.request.DeploymentStatusUpdateRequest;
import com.neuroforge.dto.response.ApiResponse;
import com.neuroforge.dto.response.DeploymentResponse;
import com.neuroforge.dto.response.ReleaseHealthResponse;
import com.neuroforge.security.UserDetailsImpl;
import com.neuroforge.service.DeploymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DeploymentController {

    private final DeploymentService deploymentService;

    // POST /api/deployments — Trigger a deployment for a release to an environment
    @PostMapping("/deployments")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_DEVOPS_ENGINEER')")
    public ResponseEntity<ApiResponse<DeploymentResponse>> createDeployment(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody DeploymentCreateRequest request) {
        DeploymentResponse response = deploymentService.createDeployment(currentUser.getUserId(), request);
        return new ResponseEntity<>(
                ApiResponse.success("Deployment triggered successfully", response),
                HttpStatus.CREATED
        );
    }

    // GET /api/projects/{projectId}/deployments — List all deployments in a project
    @GetMapping("/projects/{projectId}/deployments")
    public ResponseEntity<ApiResponse<List<DeploymentResponse>>> getDeploymentsByProject(
            @PathVariable Long projectId,
            @RequestParam(required = false) String environment,
            @RequestParam(required = false) String status) {
        List<DeploymentResponse> response = deploymentService.getDeploymentsByProject(projectId, environment, status);
        return ResponseEntity.ok(ApiResponse.success("Project deployments retrieved successfully", response));
    }

    // GET /api/releases/{releaseId}/deployments — List all deployments for a release
    @GetMapping("/releases/{releaseId}/deployments")
    public ResponseEntity<ApiResponse<List<DeploymentResponse>>> getDeploymentsByRelease(
            @PathVariable Long releaseId,
            @RequestParam(required = false) String environment) {
        List<DeploymentResponse> response = deploymentService.getDeploymentsByRelease(releaseId, environment);
        return ResponseEntity.ok(ApiResponse.success("Release deployments retrieved successfully", response));
    }

    // GET /api/deployments/my-deployments — DevOps engineer's own deployment history
    @GetMapping("/deployments/my-deployments")
    public ResponseEntity<ApiResponse<List<DeploymentResponse>>> getMyDeployments(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        List<DeploymentResponse> response = deploymentService.getMyDeployments(currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("My deployments retrieved successfully", response));
    }

    // GET /api/deployments/{deploymentId} — Get deployment details
    @GetMapping("/deployments/{deploymentId}")
    public ResponseEntity<ApiResponse<DeploymentResponse>> getDeploymentById(@PathVariable Long deploymentId) {
        DeploymentResponse response = deploymentService.getDeploymentById(deploymentId);
        return ResponseEntity.ok(ApiResponse.success("Deployment retrieved successfully", response));
    }

    // PATCH /api/deployments/{deploymentId}/status — Update deployment status (Success/Failed/Rolled Back)
    @PatchMapping("/deployments/{deploymentId}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_DEVOPS_ENGINEER')")
    public ResponseEntity<ApiResponse<DeploymentResponse>> updateDeploymentStatus(
            @PathVariable Long deploymentId,
            @Valid @RequestBody DeploymentStatusUpdateRequest request) {
        DeploymentResponse response = deploymentService.updateDeploymentStatus(deploymentId, request);
        return ResponseEntity.ok(ApiResponse.success("Deployment status updated successfully", response));
    }

    // GET /api/projects/{projectId}/release-health — Project release pipeline health dashboard
    @GetMapping("/projects/{projectId}/release-health")
    public ResponseEntity<ApiResponse<ReleaseHealthResponse>> getProjectReleaseHealth(@PathVariable Long projectId) {
        ReleaseHealthResponse response = deploymentService.getProjectReleaseHealth(projectId);
        return ResponseEntity.ok(ApiResponse.success("Release health metrics retrieved successfully", response));
    }

    // DELETE /api/deployments/{deploymentId} — Delete a deployment record
    @DeleteMapping("/deployments/{deploymentId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteDeployment(@PathVariable Long deploymentId) {
        deploymentService.deleteDeployment(deploymentId);
        return ResponseEntity.ok(ApiResponse.success("Deployment deleted successfully", null));
    }
}
