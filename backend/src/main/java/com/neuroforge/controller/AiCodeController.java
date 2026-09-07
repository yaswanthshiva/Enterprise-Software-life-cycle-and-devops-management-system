package com.neuroforge.controller;

import com.neuroforge.dto.request.AiCodeGenerateRequest;
import com.neuroforge.dto.request.AiCodeRefactorRequest;
import com.neuroforge.dto.request.AiCodeReviewRequest;
import com.neuroforge.dto.request.AiUnitTestGenerateRequest;
import com.neuroforge.dto.response.ApiResponse;
import com.neuroforge.dto.response.AiSuggestionResponse;
import com.neuroforge.security.UserDetailsImpl;
import com.neuroforge.service.AiCodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiCodeController {

    private final AiCodeService aiCodeService;

    @PostMapping("/tasks/{taskId}/generate-code")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_DEVELOPER')")
    public ResponseEntity<ApiResponse<AiSuggestionResponse>> generateTaskCode(
            @PathVariable Long taskId,
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestBody(required = false) AiCodeGenerateRequest request) {
        AiSuggestionResponse response = aiCodeService.generateTaskCode(
                taskId,
                currentUser.getUserId(),
                request != null ? request : new AiCodeGenerateRequest()
        );
        return new ResponseEntity<>(
                ApiResponse.success("AI Code Generation completed successfully", response),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/tasks/{taskId}/review-code")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_DEVELOPER', 'ROLE_TESTER', 'ROLE_DEVOPS_ENGINEER')")
    public ResponseEntity<ApiResponse<AiSuggestionResponse>> reviewCode(
            @PathVariable Long taskId,
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody AiCodeReviewRequest request) {
        AiSuggestionResponse response = aiCodeService.reviewCode(
                taskId,
                currentUser.getUserId(),
                request
        );
        return new ResponseEntity<>(
                ApiResponse.success("AI Code Review completed successfully", response),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/tasks/{taskId}/generate-unit-tests")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_DEVELOPER', 'ROLE_TESTER')")
    public ResponseEntity<ApiResponse<AiSuggestionResponse>> generateUnitTests(
            @PathVariable Long taskId,
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestBody(required = false) AiUnitTestGenerateRequest request) {
        AiSuggestionResponse response = aiCodeService.generateUnitTests(
                taskId,
                currentUser.getUserId(),
                request != null ? request : new AiUnitTestGenerateRequest()
        );
        return new ResponseEntity<>(
                ApiResponse.success("AI Unit Test Generation completed successfully", response),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/tasks/{taskId}/refactor-code")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_DEVELOPER')")
    public ResponseEntity<ApiResponse<AiSuggestionResponse>> refactorCode(
            @PathVariable Long taskId,
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody AiCodeRefactorRequest request) {
        AiSuggestionResponse response = aiCodeService.refactorCode(
                taskId,
                currentUser.getUserId(),
                request
        );
        return new ResponseEntity<>(
                ApiResponse.success("AI Code Refactoring completed successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/tasks/{taskId}/suggestions")
    public ResponseEntity<ApiResponse<List<AiSuggestionResponse>>> getSuggestionsByTask(
            @PathVariable Long taskId) {
        List<AiSuggestionResponse> response = aiCodeService.getSuggestionsByTask(taskId);
        return ResponseEntity.ok(ApiResponse.success("AI Task Suggestions retrieved successfully", response));
    }
}
