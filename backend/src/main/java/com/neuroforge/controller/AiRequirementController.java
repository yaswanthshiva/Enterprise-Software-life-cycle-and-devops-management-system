package com.neuroforge.controller;

import com.neuroforge.dto.request.AiArchitectureRequest;
import com.neuroforge.dto.request.AiGenerateStoriesRequest;
import com.neuroforge.dto.request.AiRequirementImproveRequest;
import com.neuroforge.dto.request.AiSuggestionReviewRequest;
import com.neuroforge.dto.response.ApiResponse;
import com.neuroforge.dto.response.AiSuggestionResponse;
import com.neuroforge.security.UserDetailsImpl;
import com.neuroforge.service.AiRequirementService;
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
public class AiRequirementController {

    private final AiRequirementService aiRequirementService;

    @PostMapping("/requirements/{requirementId}/improve")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_BUSINESS_ANALYST')")
    public ResponseEntity<ApiResponse<AiSuggestionResponse>> improveRequirement(
            @PathVariable Long requirementId,
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestBody(required = false) AiRequirementImproveRequest request) {
        AiSuggestionResponse response = aiRequirementService.improveRequirement(
                requirementId,
                currentUser.getUserId(),
                request != null ? request : new AiRequirementImproveRequest()
        );
        return new ResponseEntity<>(
                ApiResponse.success("AI Requirement Analysis generated successfully", response),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/requirements/{requirementId}/generate-stories")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_BUSINESS_ANALYST')")
    public ResponseEntity<ApiResponse<AiSuggestionResponse>> generateUserStories(
            @PathVariable Long requirementId,
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestBody(required = false) AiGenerateStoriesRequest request) {
        AiSuggestionResponse response = aiRequirementService.generateUserStories(
                requirementId,
                currentUser.getUserId(),
                request != null ? request : new AiGenerateStoriesRequest()
        );
        return new ResponseEntity<>(
                ApiResponse.success("AI User Stories generated successfully", response),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/requirements/{requirementId}/architecture")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_BUSINESS_ANALYST', 'ROLE_DEVELOPER')")
    public ResponseEntity<ApiResponse<AiSuggestionResponse>> generateArchitectureDesign(
            @PathVariable Long requirementId,
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestBody(required = false) AiArchitectureRequest request) {
        AiSuggestionResponse response = aiRequirementService.generateArchitectureDesign(
                requirementId,
                currentUser.getUserId(),
                request != null ? request : new AiArchitectureRequest()
        );
        return new ResponseEntity<>(
                ApiResponse.success("AI Architecture Design generated successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/requirements/{requirementId}/suggestions")
    public ResponseEntity<ApiResponse<List<AiSuggestionResponse>>> getSuggestionsByRequirement(
            @PathVariable Long requirementId) {
        List<AiSuggestionResponse> response = aiRequirementService.getSuggestionsByRequirement(requirementId);
        return ResponseEntity.ok(ApiResponse.success("AI Suggestions retrieved successfully", response));
    }

    @GetMapping("/suggestions/{suggestionId}")
    public ResponseEntity<ApiResponse<AiSuggestionResponse>> getSuggestionById(
            @PathVariable Long suggestionId) {
        AiSuggestionResponse response = aiRequirementService.getSuggestionById(suggestionId);
        return ResponseEntity.ok(ApiResponse.success("AI Suggestion retrieved successfully", response));
    }

    @PostMapping("/suggestions/{suggestionId}/review")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER', 'ROLE_BUSINESS_ANALYST')")
    public ResponseEntity<ApiResponse<AiSuggestionResponse>> reviewSuggestion(
            @PathVariable Long suggestionId,
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody AiSuggestionReviewRequest request) {
        AiSuggestionResponse response = aiRequirementService.reviewSuggestion(
                suggestionId,
                currentUser.getUserId(),
                request
        );
        return ResponseEntity.ok(ApiResponse.success("AI Suggestion reviewed successfully", response));
    }
}
