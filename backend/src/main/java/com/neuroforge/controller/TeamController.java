package com.neuroforge.controller;

import com.neuroforge.dto.request.TeamCreateRequest;
import com.neuroforge.dto.request.TeamMemberAddRequest;
import com.neuroforge.dto.request.TeamUpdateRequest;
import com.neuroforge.dto.response.ApiResponse;
import com.neuroforge.dto.response.TeamMemberResponse;
import com.neuroforge.dto.response.TeamResponse;
import com.neuroforge.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping("/projects/{projectId}/teams")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<TeamResponse>> createTeam(
            @PathVariable Long projectId,
            @Valid @RequestBody TeamCreateRequest request) {
        TeamResponse response = teamService.createTeam(projectId, request);
        return new ResponseEntity<>(
                ApiResponse.success("Team created successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/projects/{projectId}/teams")
    public ResponseEntity<ApiResponse<List<TeamResponse>>> getTeamsByProject(@PathVariable Long projectId) {
        List<TeamResponse> response = teamService.getTeamsByProject(projectId);
        return ResponseEntity.ok(ApiResponse.success("Teams retrieved successfully", response));
    }

    @GetMapping("/teams/{teamId}")
    public ResponseEntity<ApiResponse<TeamResponse>> getTeamById(@PathVariable Long teamId) {
        TeamResponse response = teamService.getTeamById(teamId);
        return ResponseEntity.ok(ApiResponse.success("Team retrieved successfully", response));
    }

    @PutMapping("/teams/{teamId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<TeamResponse>> updateTeam(
            @PathVariable Long teamId,
            @Valid @RequestBody TeamUpdateRequest request) {
        TeamResponse response = teamService.updateTeam(teamId, request);
        return ResponseEntity.ok(ApiResponse.success("Team updated successfully", response));
    }

    @DeleteMapping("/teams/{teamId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteTeam(@PathVariable Long teamId) {
        teamService.deleteTeam(teamId);
        return ResponseEntity.ok(ApiResponse.success("Team deleted successfully", null));
    }

    @PostMapping("/teams/{teamId}/members")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<TeamMemberResponse>> addMemberToTeam(
            @PathVariable Long teamId,
            @Valid @RequestBody TeamMemberAddRequest request) {
        TeamMemberResponse response = teamService.addMemberToTeam(teamId, request);
        return new ResponseEntity<>(
                ApiResponse.success("Member added to team successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/teams/{teamId}/members")
    public ResponseEntity<ApiResponse<List<TeamMemberResponse>>> getTeamMembers(@PathVariable Long teamId) {
        List<TeamMemberResponse> response = teamService.getTeamMembers(teamId);
        return ResponseEntity.ok(ApiResponse.success("Team members retrieved successfully", response));
    }

    @DeleteMapping("/teams/{teamId}/members/{userId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> removeMemberFromTeam(
            @PathVariable Long teamId,
            @PathVariable Long userId) {
        teamService.removeMemberFromTeam(teamId, userId);
        return ResponseEntity.ok(ApiResponse.success("Member removed from team successfully", null));
    }
}
