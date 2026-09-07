package com.neuroforge.service;

import com.neuroforge.dto.request.ReleaseCreateRequest;
import com.neuroforge.dto.request.ReleaseUpdateRequest;
import com.neuroforge.dto.response.ReleaseResponse;
import com.neuroforge.entity.Project;
import com.neuroforge.entity.Release;
import com.neuroforge.entity.User;
import com.neuroforge.exception.BadRequestException;
import com.neuroforge.exception.ResourceNotFoundException;
import com.neuroforge.repository.ProjectRepository;
import com.neuroforge.repository.ReleaseRepository;
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
public class ReleaseService {

    private final ReleaseRepository releaseRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReleaseResponse createRelease(Long creatorUserId, ReleaseCreateRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));

        User creator = userRepository.findById(creatorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", creatorUserId));

        // Enforce unique version number per project
        if (releaseRepository.existsByProject_ProjectIdAndVersionNumberIgnoreCase(
                request.getProjectId(), request.getVersionNumber().trim())) {
            throw new BadRequestException(
                "Version '" + request.getVersionNumber() + "' already exists for project '"
                + project.getName() + "'. Use a different version number (e.g. v1.0.1).");
        }

        Release release = Release.builder()
                .project(project)
                .versionNumber(request.getVersionNumber().trim())
                .releaseName(request.getReleaseName() != null ? request.getReleaseName().trim() : null)
                .releaseNotes(request.getReleaseNotes())
                .status(request.getStatus() != null && !request.getStatus().trim().isEmpty()
                        ? request.getStatus().trim() : "Draft")
                .releaseDate(request.getReleaseDate())
                .createdBy(creator)
                .build();

        Release saved = releaseRepository.save(release);
        log.info("Release created: id={}, version={}, project={}", saved.getReleaseId(),
                saved.getVersionNumber(), project.getName());
        return ReleaseResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<ReleaseResponse> getReleasesByProject(Long projectId, String status) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project", "id", projectId);
        }

        List<Release> releases;
        if (status != null && !status.trim().isEmpty()) {
            releases = releaseRepository.findByProject_ProjectIdAndStatusIgnoreCase(projectId, status.trim());
        } else {
            releases = releaseRepository.findByProject_ProjectIdOrderByCreatedAtDesc(projectId);
        }

        return releases.stream().map(ReleaseResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReleaseResponse getReleaseById(Long releaseId) {
        Release release = releaseRepository.findById(releaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Release", "id", releaseId));
        return ReleaseResponse.fromEntity(release);
    }

    @Transactional
    public ReleaseResponse updateRelease(Long releaseId, ReleaseUpdateRequest request) {
        Release release = releaseRepository.findById(releaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Release", "id", releaseId));

        if (request.getReleaseName() != null && !request.getReleaseName().trim().isEmpty()) {
            release.setReleaseName(request.getReleaseName().trim());
        }
        if (request.getReleaseNotes() != null) {
            release.setReleaseNotes(request.getReleaseNotes());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            release.setStatus(request.getStatus().trim());
        }
        if (request.getReleaseDate() != null) {
            release.setReleaseDate(request.getReleaseDate());
        }

        Release updated = releaseRepository.save(release);
        log.info("Release updated: id={}, status={}, version={}", releaseId,
                updated.getStatus(), updated.getVersionNumber());
        return ReleaseResponse.fromEntity(updated);
    }

    @Transactional
    public ReleaseResponse updateReleaseStatus(Long releaseId, String status) {
        Release release = releaseRepository.findById(releaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Release", "id", releaseId));

        release.setStatus(status.trim());
        Release updated = releaseRepository.save(release);
        log.info("Release status updated: id={}, status={}", releaseId, updated.getStatus());
        return ReleaseResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteRelease(Long releaseId) {
        Release release = releaseRepository.findById(releaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Release", "id", releaseId));

        releaseRepository.delete(release);
        log.info("Release deleted: id={}, version={}", releaseId, release.getVersionNumber());
    }
}
