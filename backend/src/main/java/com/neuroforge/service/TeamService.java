package com.neuroforge.service;

import com.neuroforge.dto.request.TeamCreateRequest;
import com.neuroforge.dto.request.TeamMemberAddRequest;
import com.neuroforge.dto.request.TeamUpdateRequest;
import com.neuroforge.dto.response.TeamMemberResponse;
import com.neuroforge.dto.response.TeamResponse;
import com.neuroforge.entity.*;
import com.neuroforge.exception.BadRequestException;
import com.neuroforge.exception.ResourceNotFoundException;
import com.neuroforge.repository.ProjectRepository;
import com.neuroforge.repository.TeamMemberRepository;
import com.neuroforge.repository.TeamRepository;
import com.neuroforge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public TeamResponse createTeam(Long projectId, TeamCreateRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        Team team = Team.builder()
                .project(project)
                .teamName(request.getTeamName().trim())
                .description(request.getDescription())
                .build();

        Team saved = teamRepository.save(team);
        log.info("Team created: id={}, name={}, projectId={}", saved.getTeamId(), saved.getTeamName(), projectId);
        return TeamResponse.fromEntity(saved, 0);
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> getTeamsByProject(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project", "id", projectId);
        }

        return teamRepository.findByProject_ProjectId(projectId)
                .stream()
                .map(team -> {
                    int count = teamMemberRepository.findById_TeamId(team.getTeamId()).size();
                    return TeamResponse.fromEntity(team, count);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TeamResponse getTeamById(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", teamId));
        int count = teamMemberRepository.findById_TeamId(teamId).size();
        return TeamResponse.fromEntity(team, count);
    }

    @Transactional
    public TeamResponse updateTeam(Long teamId, TeamUpdateRequest request) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", teamId));

        if (request.getTeamName() != null && !request.getTeamName().trim().isEmpty()) {
            team.setTeamName(request.getTeamName().trim());
        }
        if (request.getDescription() != null) {
            team.setDescription(request.getDescription());
        }

        Team updated = teamRepository.save(team);
        int count = teamMemberRepository.findById_TeamId(teamId).size();
        log.info("Team updated: id={}, name={}", updated.getTeamId(), updated.getTeamName());
        return TeamResponse.fromEntity(updated, count);
    }

    @Transactional
    public void deleteTeam(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", teamId));

        // Remove team members first
        List<TeamMember> members = teamMemberRepository.findById_TeamId(teamId);
        teamMemberRepository.deleteAll(members);

        teamRepository.delete(team);
        log.info("Team deleted: id={}", teamId);
    }

    @Transactional
    public TeamMemberResponse addMemberToTeam(Long teamId, TeamMemberAddRequest request) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", teamId));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        if (teamMemberRepository.existsById_TeamIdAndId_UserId(teamId, request.getUserId())) {
            throw new BadRequestException(String.format("User '%s' is already a member of team '%s'", user.getName(), team.getTeamName()));
        }

        TeamMemberId memberId = new TeamMemberId(teamId, user.getUserId());
        TeamMember member = TeamMember.builder()
                .id(memberId)
                .team(team)
                .user(user)
                .roleInTeam(request.getRoleInTeam().trim())
                .joinedDate(LocalDate.now())
                .build();

        TeamMember saved = teamMemberRepository.save(member);
        log.info("Member added to team: teamId={}, userId={}, role={}", teamId, user.getUserId(), request.getRoleInTeam());
        return TeamMemberResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<TeamMemberResponse> getTeamMembers(Long teamId) {
        if (!teamRepository.existsById(teamId)) {
            throw new ResourceNotFoundException("Team", "id", teamId);
        }

        return teamMemberRepository.findById_TeamId(teamId)
                .stream()
                .map(TeamMemberResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeMemberFromTeam(Long teamId, Long userId) {
        TeamMemberId memberId = new TeamMemberId(teamId, userId);
        if (!teamMemberRepository.existsById(memberId)) {
            throw new ResourceNotFoundException("TeamMember", "teamId and userId", teamId + ", " + userId);
        }

        teamMemberRepository.deleteById(memberId);
        log.info("Member removed from team: teamId={}, userId={}", teamId, userId);
    }
}
