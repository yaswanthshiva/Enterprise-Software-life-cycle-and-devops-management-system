package com.neuroforge.service;

import com.neuroforge.dto.request.RequirementCreateRequest;
import com.neuroforge.dto.request.RequirementUpdateRequest;
import com.neuroforge.dto.response.RequirementResponse;
import com.neuroforge.entity.AiSuggestion;
import com.neuroforge.entity.Project;
import com.neuroforge.entity.Requirement;
import com.neuroforge.entity.Task;
import com.neuroforge.entity.User;
import com.neuroforge.entity.UserStory;
import com.neuroforge.exception.ResourceNotFoundException;
import com.neuroforge.repository.AiSuggestionRepository;
import com.neuroforge.repository.ProjectRepository;
import com.neuroforge.repository.RequirementRepository;
import com.neuroforge.repository.TaskRepository;
import com.neuroforge.repository.UserRepository;
import com.neuroforge.repository.UserStoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RequirementService {

    private final RequirementRepository requirementRepository;
    private final UserStoryRepository userStoryRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final AiSuggestionRepository aiSuggestionRepository;

    @Transactional
    public RequirementResponse createRequirement(Long projectId, Long createdById, RequirementCreateRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        User creator = null;
        if (createdById != null) {
            creator = userRepository.findById(createdById).orElse(null);
        }

        Requirement requirement = Requirement.builder()
                .project(project)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .priority(request.getPriority() != null && !request.getPriority().trim().isEmpty() 
                        ? request.getPriority().trim() : "Medium")
                .status(request.getStatus() != null && !request.getStatus().trim().isEmpty() 
                        ? request.getStatus().trim() : "Draft")
                .createdBy(creator)
                .build();

        Requirement saved = requirementRepository.save(requirement);
        log.info("Requirement created: id={}, title={}, projectId={}", saved.getRequirementId(), saved.getTitle(), projectId);
        return RequirementResponse.fromEntity(saved, 0);
    }

    @Transactional(readOnly = true)
    public List<RequirementResponse> getRequirementsByProject(Long projectId, String status) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project", "id", projectId);
        }

        List<Requirement> requirements;
        if (status != null && !status.trim().isEmpty()) {
            requirements = requirementRepository.findByProject_ProjectIdAndStatusIgnoreCase(projectId, status.trim());
        } else {
            requirements = requirementRepository.findByProject_ProjectId(projectId);
        }

        return requirements.stream()
                .map(req -> {
                    int count = userStoryRepository.findByRequirement_RequirementId(req.getRequirementId()).size();
                    return RequirementResponse.fromEntity(req, count);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RequirementResponse getRequirementById(Long requirementId) {
        Requirement requirement = requirementRepository.findById(requirementId)
                .orElseThrow(() -> new ResourceNotFoundException("Requirement", "id", requirementId));
        int count = userStoryRepository.findByRequirement_RequirementId(requirementId).size();
        return RequirementResponse.fromEntity(requirement, count);
    }

    @Transactional
    public RequirementResponse updateRequirement(Long requirementId, RequirementUpdateRequest request) {
        Requirement requirement = requirementRepository.findById(requirementId)
                .orElseThrow(() -> new ResourceNotFoundException("Requirement", "id", requirementId));

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            requirement.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            requirement.setDescription(request.getDescription());
        }
        if (request.getPriority() != null && !request.getPriority().trim().isEmpty()) {
            requirement.setPriority(request.getPriority().trim());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            requirement.setStatus(request.getStatus().trim());
        }

        Requirement updated = requirementRepository.save(requirement);
        int count = userStoryRepository.findByRequirement_RequirementId(requirementId).size();
        log.info("Requirement updated: id={}, title={}, status={}", updated.getRequirementId(), updated.getTitle(), updated.getStatus());
        return RequirementResponse.fromEntity(updated, count);
    }

    @Transactional
    public RequirementResponse updateRequirementStatus(Long requirementId, String status) {
        Requirement requirement = requirementRepository.findById(requirementId)
                .orElseThrow(() -> new ResourceNotFoundException("Requirement", "id", requirementId));

        requirement.setStatus(status.trim());
        Requirement updated = requirementRepository.save(requirement);
        int count = userStoryRepository.findByRequirement_RequirementId(requirementId).size();
        log.info("Requirement status updated: id={}, status={}", updated.getRequirementId(), status);
        return RequirementResponse.fromEntity(updated, count);
    }

    @Transactional
    public void deleteRequirement(Long requirementId) {
        Requirement requirement = requirementRepository.findById(requirementId)
                .orElseThrow(() -> new ResourceNotFoundException("Requirement", "id", requirementId));

        // 1. Delete associated AI suggestions for this requirement
        List<AiSuggestion> suggestions = aiSuggestionRepository.findByRequirement_RequirementIdOrderByGeneratedTimeDesc(requirementId);
        if (!suggestions.isEmpty()) {
            aiSuggestionRepository.deleteAll(suggestions);
            log.info("Deleted {} AI suggestions for requirement id={}", suggestions.size(), requirementId);
        }

        // 2. Unlink user stories from any tasks referencing them so tasks are preserved on the board
        List<UserStory> stories = userStoryRepository.findByRequirement_RequirementId(requirementId);
        for (UserStory story : stories) {
            List<Task> linkedTasks = taskRepository.findByStory_StoryId(story.getStoryId());
            for (Task task : linkedTasks) {
                task.setStory(null);
            }
            if (!linkedTasks.isEmpty()) {
                taskRepository.saveAll(linkedTasks);
                log.info("Unlinked {} tasks from user story id={}", linkedTasks.size(), story.getStoryId());
            }
        }

        // 3. Delete associated user stories
        if (!stories.isEmpty()) {
            userStoryRepository.deleteAll(stories);
            log.info("Deleted {} user stories for requirement id={}", stories.size(), requirementId);
        }

        // 4. Delete the requirement
        requirementRepository.delete(requirement);
        log.info("Requirement deleted: id={}", requirementId);
    }
}
