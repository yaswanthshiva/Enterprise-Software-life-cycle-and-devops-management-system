package com.neuroforge.controller;

import com.neuroforge.dto.request.TestCaseCreateRequest;
import com.neuroforge.dto.request.TestCaseExecuteRequest;
import com.neuroforge.dto.request.TestCaseUpdateRequest;
import com.neuroforge.dto.response.ApiResponse;
import com.neuroforge.dto.response.TestCaseResponse;
import com.neuroforge.security.UserDetailsImpl;
import com.neuroforge.service.TestCaseService;
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
public class TestCaseController {

    private final TestCaseService testCaseService;

    @PostMapping("/test-cases")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_TESTER', 'ROLE_DEVELOPER')")
    public ResponseEntity<ApiResponse<TestCaseResponse>> createTestCase(@Valid @RequestBody TestCaseCreateRequest request) {
        TestCaseResponse response = testCaseService.createTestCase(request);
        return new ResponseEntity<>(
                ApiResponse.success("Test case created successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/tasks/{taskId}/test-cases")
    public ResponseEntity<ApiResponse<List<TestCaseResponse>>> getTestCasesByTask(@PathVariable Long taskId) {
        List<TestCaseResponse> response = testCaseService.getTestCasesByTask(taskId);
        return ResponseEntity.ok(ApiResponse.success("Test cases retrieved successfully", response));
    }

    @GetMapping("/sprints/{sprintId}/test-cases")
    public ResponseEntity<ApiResponse<List<TestCaseResponse>>> getTestCasesBySprint(@PathVariable Long sprintId) {
        List<TestCaseResponse> response = testCaseService.getTestCasesBySprint(sprintId);
        return ResponseEntity.ok(ApiResponse.success("Sprint test cases retrieved successfully", response));
    }

    @GetMapping("/projects/{projectId}/test-cases")
    public ResponseEntity<ApiResponse<List<TestCaseResponse>>> getTestCasesByProject(@PathVariable Long projectId) {
        List<TestCaseResponse> response = testCaseService.getTestCasesByProject(projectId);
        return ResponseEntity.ok(ApiResponse.success("Project test cases retrieved successfully", response));
    }

    @GetMapping("/test-cases/{testCaseId}")
    public ResponseEntity<ApiResponse<TestCaseResponse>> getTestCaseById(@PathVariable Long testCaseId) {
        TestCaseResponse response = testCaseService.getTestCaseById(testCaseId);
        return ResponseEntity.ok(ApiResponse.success("Test case retrieved successfully", response));
    }

    @PutMapping("/test-cases/{testCaseId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_TESTER', 'ROLE_DEVELOPER')")
    public ResponseEntity<ApiResponse<TestCaseResponse>> updateTestCase(
            @PathVariable Long testCaseId,
            @Valid @RequestBody TestCaseUpdateRequest request) {
        TestCaseResponse response = testCaseService.updateTestCase(testCaseId, request);
        return ResponseEntity.ok(ApiResponse.success("Test case updated successfully", response));
    }

    @PatchMapping("/test-cases/{testCaseId}/execute")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_TESTER', 'ROLE_DEVELOPER')")
    public ResponseEntity<ApiResponse<TestCaseResponse>> executeTestCase(
            @PathVariable Long testCaseId,
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody TestCaseExecuteRequest request) {
        TestCaseResponse response = testCaseService.executeTestCase(testCaseId, currentUser.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Test case execution status updated", response));
    }

    @DeleteMapping("/test-cases/{testCaseId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_TESTER')")
    public ResponseEntity<ApiResponse<Void>> deleteTestCase(@PathVariable Long testCaseId) {
        testCaseService.deleteTestCase(testCaseId);
        return ResponseEntity.ok(ApiResponse.success("Test case deleted successfully", null));
    }
}
