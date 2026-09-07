package com.neuroforge.controller;

import com.neuroforge.dto.request.IssueCreateRequest;
import com.neuroforge.dto.request.IssueStatusUpdateRequest;
import com.neuroforge.dto.request.IssueUpdateRequest;
import com.neuroforge.dto.response.ApiResponse;
import com.neuroforge.dto.response.IssueResponse;
import com.neuroforge.dto.response.QaMetricsResponse;
import com.neuroforge.security.UserDetailsImpl;
import com.neuroforge.service.IssueService;
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
public class IssueController {

    private final IssueService issueService;

    @PostMapping("/issues")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_TESTER', 'ROLE_DEVELOPER', 'ROLE_DEVOPS_ENGINEER')")
    public ResponseEntity<ApiResponse<IssueResponse>> createIssue(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody IssueCreateRequest request) {
        IssueResponse response = issueService.createIssue(currentUser.getUserId(), request);
        return new ResponseEntity<>(
                ApiResponse.success("Issue reported successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/tasks/{taskId}/issues")
    public ResponseEntity<ApiResponse<List<IssueResponse>>> getIssuesByTask(@PathVariable Long taskId) {
        List<IssueResponse> response = issueService.getIssuesByTask(taskId);
        return ResponseEntity.ok(ApiResponse.success("Task issues retrieved successfully", response));
    }

    @GetMapping("/projects/{projectId}/issues")
    public ResponseEntity<ApiResponse<List<IssueResponse>>> getIssuesByProject(
            @PathVariable Long projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String severity) {
        List<IssueResponse> response = issueService.getIssuesByProject(projectId, status, severity);
        return ResponseEntity.ok(ApiResponse.success("Project issues retrieved successfully", response));
    }

    @GetMapping("/issues/my-assigned")
    public ResponseEntity<ApiResponse<List<IssueResponse>>> getMyAssignedIssues(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestParam(required = false) String status) {
        List<IssueResponse> response = issueService.getMyAssignedIssues(currentUser.getUserId(), status);
        return ResponseEntity.ok(ApiResponse.success("Assigned issues retrieved successfully", response));
    }

    @GetMapping("/issues/my-reported")
    public ResponseEntity<ApiResponse<List<IssueResponse>>> getMyReportedIssues(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        List<IssueResponse> response = issueService.getMyReportedIssues(currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Reported issues retrieved successfully", response));
    }

    @GetMapping("/issues/{issueId}")
    public ResponseEntity<ApiResponse<IssueResponse>> getIssueById(@PathVariable Long issueId) {
        IssueResponse response = issueService.getIssueById(issueId);
        return ResponseEntity.ok(ApiResponse.success("Issue retrieved successfully", response));
    }

    @PutMapping("/issues/{issueId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_TESTER', 'ROLE_DEVELOPER')")
    public ResponseEntity<ApiResponse<IssueResponse>> updateIssue(
            @PathVariable Long issueId,
            @Valid @RequestBody IssueUpdateRequest request) {
        IssueResponse response = issueService.updateIssue(issueId, request);
        return ResponseEntity.ok(ApiResponse.success("Issue updated successfully", response));
    }

    @PatchMapping("/issues/{issueId}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_TESTER', 'ROLE_DEVELOPER')")
    public ResponseEntity<ApiResponse<IssueResponse>> updateIssueStatus(
            @PathVariable Long issueId,
            @Valid @RequestBody IssueStatusUpdateRequest request) {
        IssueResponse response = issueService.updateIssueStatus(issueId, request);
        return ResponseEntity.ok(ApiResponse.success("Issue status updated successfully", response));
    }

    @PatchMapping("/issues/{issueId}/assign")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<IssueResponse>> assignIssue(
            @PathVariable Long issueId,
            @RequestParam Long userId) {
        IssueResponse response = issueService.assignIssue(issueId, userId);
        return ResponseEntity.ok(ApiResponse.success("Issue reassigned successfully", response));
    }

    @GetMapping("/projects/{projectId}/qa-metrics")
    public ResponseEntity<ApiResponse<QaMetricsResponse>> getProjectQaMetrics(@PathVariable Long projectId) {
        QaMetricsResponse response = issueService.getProjectQaMetrics(projectId);
        return ResponseEntity.ok(ApiResponse.success("QA health metrics retrieved successfully", response));
    }

    @DeleteMapping("/issues/{issueId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteIssue(@PathVariable Long issueId) {
        issueService.deleteIssue(issueId);
        return ResponseEntity.ok(ApiResponse.success("Issue deleted successfully", null));
    }
}
