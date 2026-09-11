package com.neuroforge.service;

import com.neuroforge.dto.request.UserStoryCreateRequest;
import com.neuroforge.dto.request.UserStoryUpdateRequest;
import com.neuroforge.dto.response.UserStoryResponse;
import com.neuroforge.entity.Requirement;
import com.neuroforge.entity.UserStory;
import com.neuroforge.exception.ResourceNotFoundException;
import com.neuroforge.entity.Task;
import com.neuroforge.repository.ProjectRepository;
import com.neuroforge.repository.RequirementRepository;
import com.neuroforge.repository.TaskRepository;
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
public class UserStoryService {

    private final UserStoryRepository userStoryRepository;
    private final RequirementRepository requirementRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    @Transactional
    public UserStoryResponse createUserStory(Long requirementId, UserStoryCreateRequest request) {
        Requirement requirement = requirementRepository.findById(requirementId)
                .orElseThrow(() -> new ResourceNotFoundException("Requirement", "id", requirementId));

        UserStory story = UserStory.builder()
                .requirement(requirement)
                .storyTitle(request.getStoryTitle().trim())
                .acceptanceCriteria(request.getAcceptanceCriteria())
                .priority(request.getPriority() != null && !request.getPriority().trim().isEmpty() 
                        ? request.getPriority().trim() : "Medium")
                .storyPoints(request.getStoryPoints() != null ? request.getStoryPoints() : 3)
                .status(request.getStatus() != null && !request.getStatus().trim().isEmpty() 
                        ? request.getStatus().trim() : "Draft")
                .build();

        UserStory saved = userStoryRepository.save(story);
        log.info("UserStory created: id={}, title={}, requirementId={}", saved.getStoryId(), saved.getStoryTitle(), requirementId);
        return UserStoryResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<UserStoryResponse> getUserStoriesByRequirement(Long requirementId) {
        if (!requirementRepository.existsById(requirementId)) {
            throw new ResourceNotFoundException("Requirement", "id", requirementId);
        }

        return userStoryRepository.findByRequirement_RequirementId(requirementId)
                .stream()
                .map(UserStoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserStoryResponse> getProductBacklog(Long projectId, String status) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project", "id", projectId);
        }

        List<UserStory> stories;
        if (status != null && !status.trim().isEmpty()) {
            stories = userStoryRepository.findByRequirement_Project_ProjectIdAndStatusIgnoreCase(projectId, status.trim());
        } else {
            stories = userStoryRepository.findByRequirement_Project_ProjectId(projectId);
        }

        return stories.stream().map(UserStoryResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserStoryResponse getUserStoryById(Long storyId) {
        UserStory story = userStoryRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("UserStory", "id", storyId));
        return UserStoryResponse.fromEntity(story);
    }

    @Transactional
    public UserStoryResponse updateUserStory(Long storyId, UserStoryUpdateRequest request) {
        UserStory story = userStoryRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("UserStory", "id", storyId));

        if (request.getStoryTitle() != null && !request.getStoryTitle().trim().isEmpty()) {
            story.setStoryTitle(request.getStoryTitle().trim());
        }
        if (request.getAcceptanceCriteria() != null) {
            story.setAcceptanceCriteria(request.getAcceptanceCriteria());
        }
        if (request.getPriority() != null && !request.getPriority().trim().isEmpty()) {
            story.setPriority(request.getPriority().trim());
        }
        if (request.getStoryPoints() != null) {
            story.setStoryPoints(request.getStoryPoints());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            story.setStatus(request.getStatus().trim());
        }

        UserStory updated = userStoryRepository.save(story);
        log.info("UserStory updated: id={}, title={}, status={}, points={}", updated.getStoryId(), updated.getStoryTitle(), updated.getStatus(), updated.getStoryPoints());
        return UserStoryResponse.fromEntity(updated);
    }

    @Transactional
    public UserStoryResponse updateUserStoryStatus(Long storyId, String status) {
        UserStory story = userStoryRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("UserStory", "id", storyId));

        story.setStatus(status.trim());
        UserStory updated = userStoryRepository.save(story);
        log.info("UserStory status updated: id={}, status={}", updated.getStoryId(), status);
        return UserStoryResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteUserStory(Long storyId) {
        UserStory story = userStoryRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("UserStory", "id", storyId));

        // Unlink any tasks referencing this user story so tasks remain on the Kanban board
        List<Task> linkedTasks = taskRepository.findByStory_StoryId(storyId);
        if (!linkedTasks.isEmpty()) {
            for (Task task : linkedTasks) {
                task.setStory(null);
            }
            taskRepository.saveAll(linkedTasks);
            log.info("Unlinked {} tasks from user story id={}", linkedTasks.size(), storyId);
        }

        userStoryRepository.delete(story);
        log.info("UserStory deleted: id={}", storyId);
    }
}
