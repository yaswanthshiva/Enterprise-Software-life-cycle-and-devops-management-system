package com.neuroforge.controller;

import com.neuroforge.dto.request.RequirementCreateRequest;
import com.neuroforge.dto.request.RequirementUpdateRequest;
import com.neuroforge.dto.response.ApiResponse;
import com.neuroforge.dto.response.RequirementResponse;
import com.neuroforge.security.UserDetailsImpl;
import com.neuroforge.service.RequirementService;
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
public class RequirementController {

    private final RequirementService requirementService;

    @PostMapping("/projects/{projectId}/requirements")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_BUSINESS_ANALYST')")
    public ResponseEntity<ApiResponse<RequirementResponse>> createRequirement(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody RequirementCreateRequest request) {
        RequirementResponse response = requirementService.createRequirement(projectId, currentUser.getUserId(), request);
        return new ResponseEntity<>(
                ApiResponse.success("Requirement created successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/projects/{projectId}/requirements")
    public ResponseEntity<ApiResponse<List<RequirementResponse>>> getRequirementsByProject(
            @PathVariable Long projectId,
            @RequestParam(required = false) String status) {
        List<RequirementResponse> response = requirementService.getRequirementsByProject(projectId, status);
        return ResponseEntity.ok(ApiResponse.success("Requirements retrieved successfully", response));
    }

    @GetMapping("/requirements/{requirementId}")
    public ResponseEntity<ApiResponse<RequirementResponse>> getRequirementById(@PathVariable Long requirementId) {
        RequirementResponse response = requirementService.getRequirementById(requirementId);
        return ResponseEntity.ok(ApiResponse.success("Requirement retrieved successfully", response));
    }

    @PutMapping("/requirements/{requirementId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_BUSINESS_ANALYST')")
    public ResponseEntity<ApiResponse<RequirementResponse>> updateRequirement(
            @PathVariable Long requirementId,
            @Valid @RequestBody RequirementUpdateRequest request) {
        RequirementResponse response = requirementService.updateRequirement(requirementId, request);
        return ResponseEntity.ok(ApiResponse.success("Requirement updated successfully", response));
    }

    @PatchMapping("/requirements/{requirementId}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_BUSINESS_ANALYST')")
    public ResponseEntity<ApiResponse<RequirementResponse>> updateRequirementStatus(
            @PathVariable Long requirementId,
            @RequestBody Map<String, String> statusMap) {
        String status = statusMap.getOrDefault("status", "Draft");
        RequirementResponse response = requirementService.updateRequirementStatus(requirementId, status);
        return ResponseEntity.ok(ApiResponse.success("Requirement status updated successfully", response));
    }

    @DeleteMapping("/requirements/{requirementId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_BUSINESS_ANALYST')")
    public ResponseEntity<ApiResponse<Void>> deleteRequirement(@PathVariable Long requirementId) {
        requirementService.deleteRequirement(requirementId);
        return ResponseEntity.ok(ApiResponse.success("Requirement deleted successfully", null));
    }
}
