package com.neuroforge.service;

import com.neuroforge.dto.request.ProjectCreateRequest;
import com.neuroforge.dto.request.ProjectUpdateRequest;
import com.neuroforge.dto.response.ProjectResponse;
import com.neuroforge.entity.Project;
import com.neuroforge.entity.User;
import com.neuroforge.exception.ResourceNotFoundException;
import com.neuroforge.repository.ProjectRepository;
import com.neuroforge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProjectResponse createProject(Long ownerId, ProjectCreateRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", ownerId));

        Project project = Project.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .status(request.getStatus() != null && !request.getStatus().trim().isEmpty() 
                        ? request.getStatus().trim() : "Active")
                .owner(owner)
                .build();

        Project saved = projectRepository.save(project);
        log.info("Project created: id={}, name={}, ownerId={}", saved.getProjectId(), saved.getName(), ownerId);
        return ProjectResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjects(String statusFilter) {
        List<Project> projects;
        if (statusFilter != null && !statusFilter.trim().isEmpty()) {
            projects = projectRepository.findByStatusIgnoreCase(statusFilter.trim());
        } else {
            projects = projectRepository.findAll();
        }
        return projects.stream().map(ProjectResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjectsByOwner(Long ownerId) {
        return projectRepository.findByOwner_UserId(ownerId)
                .stream()
                .map(ProjectResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
        return ProjectResponse.fromEntity(project);
    }

    @Transactional
    public ProjectResponse updateProject(Long projectId, ProjectUpdateRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            project.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            project.setStatus(request.getStatus().trim());
        }

        Project updated = projectRepository.save(project);
        log.info("Project updated: id={}, name={}, status={}", updated.getProjectId(), updated.getName(), updated.getStatus());
        return ProjectResponse.fromEntity(updated);
    }

    @Transactional
    public ProjectResponse updateProjectStatus(Long projectId, String status) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        project.setStatus(status.trim());
        Project updated = projectRepository.save(project);
        log.info("Project status updated: id={}, status={}", updated.getProjectId(), status);
        return ProjectResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        project.setStatus("Archived");
        projectRepository.save(project);
        log.info("Project archived: id={}", projectId);
    }
}
