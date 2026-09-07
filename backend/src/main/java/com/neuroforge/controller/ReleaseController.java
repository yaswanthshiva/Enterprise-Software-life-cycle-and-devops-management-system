package com.neuroforge.controller;

import com.neuroforge.dto.request.ReleaseCreateRequest;
import com.neuroforge.dto.request.ReleaseUpdateRequest;
import com.neuroforge.dto.response.ApiResponse;
import com.neuroforge.dto.response.ReleaseResponse;
import com.neuroforge.security.UserDetailsImpl;
import com.neuroforge.service.ReleaseService;
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
public class ReleaseController {

    private final ReleaseService releaseService;

    // POST /api/releases — Create a new versioned release
    @PostMapping("/releases")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_DEVOPS_ENGINEER')")
    public ResponseEntity<ApiResponse<ReleaseResponse>> createRelease(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody ReleaseCreateRequest request) {
        ReleaseResponse response = releaseService.createRelease(currentUser.getUserId(), request);
        return new ResponseEntity<>(
                ApiResponse.success("Release created successfully", response),
                HttpStatus.CREATED
        );
    }

    // GET /api/projects/{projectId}/releases — List all releases for a project
    @GetMapping("/projects/{projectId}/releases")
    public ResponseEntity<ApiResponse<List<ReleaseResponse>>> getReleasesByProject(
            @PathVariable Long projectId,
            @RequestParam(required = false) String status) {
        List<ReleaseResponse> response = releaseService.getReleasesByProject(projectId, status);
        return ResponseEntity.ok(ApiResponse.success("Releases retrieved successfully", response));
    }

    // GET /api/releases/{releaseId} — Get a specific release by ID
    @GetMapping("/releases/{releaseId}")
    public ResponseEntity<ApiResponse<ReleaseResponse>> getReleaseById(@PathVariable Long releaseId) {
        ReleaseResponse response = releaseService.getReleaseById(releaseId);
        return ResponseEntity.ok(ApiResponse.success("Release retrieved successfully", response));
    }

    // PUT /api/releases/{releaseId} — Full update of release details
    @PutMapping("/releases/{releaseId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_DEVOPS_ENGINEER')")
    public ResponseEntity<ApiResponse<ReleaseResponse>> updateRelease(
            @PathVariable Long releaseId,
            @RequestBody ReleaseUpdateRequest request) {
        ReleaseResponse response = releaseService.updateRelease(releaseId, request);
        return ResponseEntity.ok(ApiResponse.success("Release updated successfully", response));
    }

    // PATCH /api/releases/{releaseId}/status — Transition release status
    @PatchMapping("/releases/{releaseId}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_DEVOPS_ENGINEER')")
    public ResponseEntity<ApiResponse<ReleaseResponse>> updateReleaseStatus(
            @PathVariable Long releaseId,
            @RequestParam String status) {
        ReleaseResponse response = releaseService.updateReleaseStatus(releaseId, status);
        return ResponseEntity.ok(ApiResponse.success("Release status updated successfully", response));
    }

    // DELETE /api/releases/{releaseId} — Delete a release
    @DeleteMapping("/releases/{releaseId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteRelease(@PathVariable Long releaseId) {
        releaseService.deleteRelease(releaseId);
        return ResponseEntity.ok(ApiResponse.success("Release deleted successfully", null));
    }
}
