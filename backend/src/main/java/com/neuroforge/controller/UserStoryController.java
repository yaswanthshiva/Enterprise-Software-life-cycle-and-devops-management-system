package com.neuroforge.controller;

import com.neuroforge.dto.request.UserStoryCreateRequest;
import com.neuroforge.dto.request.UserStoryUpdateRequest;
import com.neuroforge.dto.response.ApiResponse;
import com.neuroforge.dto.response.UserStoryResponse;
import com.neuroforge.service.UserStoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserStoryController {

    private final UserStoryService userStoryService;

    @PostMapping("/requirements/{requirementId}/user-stories")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_BUSINESS_ANALYST')")
    public ResponseEntity<ApiResponse<UserStoryResponse>> createUserStory(
            @PathVariable Long requirementId,
            @Valid @RequestBody UserStoryCreateRequest request) {
        UserStoryResponse response = userStoryService.createUserStory(requirementId, request);
        return new ResponseEntity<>(
                ApiResponse.success("User story created successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/requirements/{requirementId}/user-stories")
    public ResponseEntity<ApiResponse<List<UserStoryResponse>>> getUserStoriesByRequirement(@PathVariable Long requirementId) {
        List<UserStoryResponse> response = userStoryService.getUserStoriesByRequirement(requirementId);
        return ResponseEntity.ok(ApiResponse.success("User stories retrieved successfully", response));
    }

    @GetMapping("/projects/{projectId}/user-stories")
    public ResponseEntity<ApiResponse<List<UserStoryResponse>>> getProductBacklog(
            @PathVariable Long projectId,
            @RequestParam(required = false) String status) {
        List<UserStoryResponse> response = userStoryService.getProductBacklog(projectId, status);
        return ResponseEntity.ok(ApiResponse.success("Product backlog retrieved successfully", response));
    }

    @GetMapping("/user-stories/{storyId}")
    public ResponseEntity<ApiResponse<UserStoryResponse>> getUserStoryById(@PathVariable Long storyId) {
        UserStoryResponse response = userStoryService.getUserStoryById(storyId);
        return ResponseEntity.ok(ApiResponse.success("User story retrieved successfully", response));
    }

    @PutMapping("/user-stories/{storyId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_BUSINESS_ANALYST')")
    public ResponseEntity<ApiResponse<UserStoryResponse>> updateUserStory(
            @PathVariable Long storyId,
            @Valid @RequestBody UserStoryUpdateRequest request) {
        UserStoryResponse response = userStoryService.updateUserStory(storyId, request);
        return ResponseEntity.ok(ApiResponse.success("User story updated successfully", response));
    }

    @PatchMapping("/user-stories/{storyId}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_BUSINESS_ANALYST', 'ROLE_DEVELOPER')")
    public ResponseEntity<ApiResponse<UserStoryResponse>> updateUserStoryStatus(
            @PathVariable Long storyId,
            @RequestBody Map<String, String> statusMap) {
        String status = statusMap.getOrDefault("status", "Draft");
        UserStoryResponse response = userStoryService.updateUserStoryStatus(storyId, status);
        return ResponseEntity.ok(ApiResponse.success("User story status updated successfully", response));
    }

    @DeleteMapping("/user-stories/{storyId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_BUSINESS_ANALYST')")
    public ResponseEntity<ApiResponse<Void>> deleteUserStory(@PathVariable Long storyId) {
        userStoryService.deleteUserStory(storyId);
        return ResponseEntity.ok(ApiResponse.success("User story deleted successfully", null));
    }
}
