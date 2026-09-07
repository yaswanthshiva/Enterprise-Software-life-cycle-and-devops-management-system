package com.neuroforge.service;

import com.neuroforge.dto.request.DeploymentCreateRequest;
import com.neuroforge.dto.request.DeploymentStatusUpdateRequest;
import com.neuroforge.dto.response.DeploymentResponse;
import com.neuroforge.dto.response.ReleaseHealthResponse;
import com.neuroforge.entity.Deployment;
import com.neuroforge.entity.Project;
import com.neuroforge.entity.Release;
import com.neuroforge.entity.User;
import com.neuroforge.exception.ResourceNotFoundException;
import com.neuroforge.repository.DeploymentRepository;
import com.neuroforge.repository.ProjectRepository;
import com.neuroforge.repository.ReleaseRepository;
import com.neuroforge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeploymentService {

    private final DeploymentRepository deploymentRepository;
    private final ReleaseRepository releaseRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public DeploymentResponse createDeployment(Long deployerUserId, DeploymentCreateRequest request) {
        Release release = releaseRepository.findById(request.getReleaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Release", "id", request.getReleaseId()));

        User deployedBy = userRepository.findById(deployerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", deployerUserId));

        // Inherit project from the release
        Project project = release.getProject();

        LocalDateTime deploymentDate = request.getDeploymentDate() != null
                ? request.getDeploymentDate()
                : LocalDateTime.now();

        Deployment deployment = Deployment.builder()
                .project(project)
                .release(release)
                .deployedBy(deployedBy)
                .environment(request.getEnvironment().trim())
                .status(request.getStatus() != null && !request.getStatus().trim().isEmpty()
                        ? request.getStatus().trim() : "In Progress")
                .deploymentDate(deploymentDate)
                .notes(request.getNotes())
                .build();

        Deployment saved = deploymentRepository.save(deployment);
        log.info("Deployment created: id={}, release={}, env={}, deployer={}",
                saved.getDeploymentId(), release.getVersionNumber(),
                request.getEnvironment(), deployedBy.getEmail());
        return DeploymentResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<DeploymentResponse> getDeploymentsByProject(Long projectId, String environment, String status) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project", "id", projectId);
        }

        List<Deployment> deployments;
        if (environment != null && !environment.trim().isEmpty()) {
            deployments = deploymentRepository.findByProject_ProjectIdAndEnvironmentIgnoreCase(projectId, environment.trim());
        } else if (status != null && !status.trim().isEmpty()) {
            deployments = deploymentRepository.findByProject_ProjectIdAndStatusIgnoreCase(projectId, status.trim());
        } else {
            deployments = deploymentRepository.findByProject_ProjectIdOrderByCreatedAtDesc(projectId);
        }

        return deployments.stream().map(DeploymentResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DeploymentResponse> getDeploymentsByRelease(Long releaseId, String environment) {
        if (!releaseRepository.existsById(releaseId)) {
            throw new ResourceNotFoundException("Release", "id", releaseId);
        }

        List<Deployment> deployments;
        if (environment != null && !environment.trim().isEmpty()) {
            deployments = deploymentRepository.findByRelease_ReleaseIdAndEnvironmentIgnoreCase(releaseId, environment.trim());
        } else {
            deployments = deploymentRepository.findByRelease_ReleaseId(releaseId);
        }

        return deployments.stream().map(DeploymentResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DeploymentResponse> getMyDeployments(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        return deploymentRepository.findByDeployedBy_UserId(userId)
                .stream().map(DeploymentResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DeploymentResponse getDeploymentById(Long deploymentId) {
        Deployment deployment = deploymentRepository.findById(deploymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Deployment", "id", deploymentId));
        return DeploymentResponse.fromEntity(deployment);
    }

    @Transactional
    public DeploymentResponse updateDeploymentStatus(Long deploymentId, DeploymentStatusUpdateRequest request) {
        Deployment deployment = deploymentRepository.findById(deploymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Deployment", "id", deploymentId));

        deployment.setStatus(request.getStatus().trim());
        if (request.getNotes() != null) {
            deployment.setNotes(request.getNotes());
        }
        // Record completion timestamp when deployment succeeds or fails
        if ("Success".equalsIgnoreCase(request.getStatus()) ||
            "Failed".equalsIgnoreCase(request.getStatus()) ||
            "Rolled Back".equalsIgnoreCase(request.getStatus())) {
            deployment.setDeploymentDate(LocalDateTime.now());
        }

        Deployment updated = deploymentRepository.save(deployment);
        log.info("Deployment status updated: id={}, status={}, env={}",
                deploymentId, updated.getStatus(), updated.getEnvironment());
        return DeploymentResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteDeployment(Long deploymentId) {
        Deployment deployment = deploymentRepository.findById(deploymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Deployment", "id", deploymentId));
        deploymentRepository.delete(deployment);
        log.info("Deployment deleted: id={}", deploymentId);
    }

    @Transactional(readOnly = true)
    public ReleaseHealthResponse getProjectReleaseHealth(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        // Release counts
        long totalReleases = releaseRepository.findByProject_ProjectId(projectId).size();
        long draftReleases = releaseRepository.findByProject_ProjectIdAndStatusIgnoreCase(projectId, "Draft").size();
        long inProgressReleases = releaseRepository.findByProject_ProjectIdAndStatusIgnoreCase(projectId, "In Progress").size();
        long completedReleases = releaseRepository.findByProject_ProjectIdAndStatusIgnoreCase(projectId, "Released").size();
        long archivedReleases = releaseRepository.findByProject_ProjectIdAndStatusIgnoreCase(projectId, "Archived").size();

        // Deployment counts
        long totalDeployments = deploymentRepository.countByProject_ProjectId(projectId);
        long successfulDeployments = deploymentRepository.countByProject_ProjectIdAndStatusIgnoreCase(projectId, "Success");
        long failedDeployments = deploymentRepository.countByProject_ProjectIdAndStatusIgnoreCase(projectId, "Failed");
        long rolledBackDeployments = deploymentRepository.countByProject_ProjectIdAndStatusIgnoreCase(projectId, "Rolled Back");
        long inProgressDeployments = deploymentRepository.countByProject_ProjectIdAndStatusIgnoreCase(projectId, "In Progress");

        // Environment breakdown
        long devDeployments = deploymentRepository.countByProject_ProjectIdAndEnvironmentIgnoreCase(projectId, "Development");
        long stagingDeployments = deploymentRepository.countByProject_ProjectIdAndEnvironmentIgnoreCase(projectId, "Staging");
        long prodDeployments = deploymentRepository.countByProject_ProjectIdAndEnvironmentIgnoreCase(projectId, "Production");

        double successRate = totalDeployments > 0
                ? ((double) successfulDeployments / totalDeployments) * 100.0 : 0.0;

        return ReleaseHealthResponse.builder()
                .projectId(projectId)
                .projectName(project.getName())
                .totalReleases(totalReleases)
                .draftReleases(draftReleases)
                .inProgressReleases(inProgressReleases)
                .completedReleases(completedReleases)
                .archivedReleases(archivedReleases)
                .totalDeployments(totalDeployments)
                .successfulDeployments(successfulDeployments)
                .failedDeployments(failedDeployments)
                .rolledBackDeployments(rolledBackDeployments)
                .inProgressDeployments(inProgressDeployments)
                .developmentDeployments(devDeployments)
                .stagingDeployments(stagingDeployments)
                .productionDeployments(prodDeployments)
                .deploymentSuccessRatePercentage(Math.round(successRate * 100.0) / 100.0)
                .build();
    }
}
