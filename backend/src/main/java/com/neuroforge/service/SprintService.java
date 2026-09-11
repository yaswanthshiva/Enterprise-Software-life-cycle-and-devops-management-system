package com.neuroforge.service;

import com.neuroforge.dto.request.SprintCreateRequest;
import com.neuroforge.dto.request.SprintUpdateRequest;
import com.neuroforge.dto.response.SprintResponse;
import com.neuroforge.entity.AiSuggestion;
import com.neuroforge.entity.Issue;
import com.neuroforge.entity.Project;
import com.neuroforge.entity.Sprint;
import com.neuroforge.entity.Task;
import com.neuroforge.entity.TestCase;
import com.neuroforge.exception.BadRequestException;
import com.neuroforge.exception.ResourceNotFoundException;
import com.neuroforge.repository.AiSuggestionRepository;
import com.neuroforge.repository.IssueRepository;
import com.neuroforge.repository.ProjectRepository;
import com.neuroforge.repository.SprintRepository;
import com.neuroforge.repository.TaskRepository;
import com.neuroforge.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final TestCaseRepository testCaseRepository;
    private final IssueRepository issueRepository;
    private final AiSuggestionRepository aiSuggestionRepository;

    @Transactional
    public SprintResponse createSprint(Long projectId, SprintCreateRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("Sprint end date cannot be before start date");
        }

        Sprint sprint = Sprint.builder()
                .project(project)
                .sprintName(request.getSprintName().trim())
                .goal(request.getGoal())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus() != null && !request.getStatus().trim().isEmpty() 
                        ? request.getStatus().trim() : "Planned")
                .build();

        Sprint saved = sprintRepository.save(sprint);
        log.info("Sprint created: id={}, name={}, projectId={}", saved.getSprintId(), saved.getSprintName(), projectId);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SprintResponse> getSprintsByProject(Long projectId, String status) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project", "id", projectId);
        }

        List<Sprint> sprints;
        if (status != null && !status.trim().isEmpty()) {
            sprints = sprintRepository.findByProject_ProjectIdAndStatusIgnoreCase(projectId, status.trim());
        } else {
            sprints = sprintRepository.findByProject_ProjectIdOrderByStartDateAsc(projectId);
        }

        return sprints.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SprintResponse getActiveSprint(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project", "id", projectId);
        }

        Sprint activeSprint = sprintRepository.findFirstByProject_ProjectIdAndStatusIgnoreCase(projectId, "Active")
                .orElseThrow(() -> new ResourceNotFoundException("Active Sprint for Project", "id", projectId));

        return mapToResponse(activeSprint);
    }

    @Transactional(readOnly = true)
    public SprintResponse getSprintById(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", sprintId));
        return mapToResponse(sprint);
    }

    @Transactional
    public SprintResponse updateSprint(Long sprintId, SprintUpdateRequest request) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", sprintId));

        if (request.getSprintName() != null && !request.getSprintName().trim().isEmpty()) {
            sprint.setSprintName(request.getSprintName().trim());
        }
        if (request.getGoal() != null) {
            sprint.setGoal(request.getGoal());
        }
        if (request.getStartDate() != null) {
            sprint.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            sprint.setEndDate(request.getEndDate());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            sprint.setStatus(request.getStatus().trim());
        }

        if (sprint.getEndDate().isBefore(sprint.getStartDate())) {
            throw new BadRequestException("Sprint end date cannot be before start date");
        }

        Sprint updated = sprintRepository.save(sprint);
        log.info("Sprint updated: id={}, status={}", updated.getSprintId(), updated.getStatus());
        return mapToResponse(updated);
    }

    @Transactional
    public SprintResponse startSprint(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", sprintId));

        sprint.setStatus("Active");
        Sprint updated = sprintRepository.save(sprint);
        log.info("Sprint started (Active): id={}", sprintId);
        return mapToResponse(updated);
    }

    @Transactional
    public SprintResponse completeSprint(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", sprintId));

        sprint.setStatus("Completed");
        Sprint updated = sprintRepository.save(sprint);
        log.info("Sprint completed: id={}", sprintId);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteSprint(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", sprintId));

        List<Task> tasks = taskRepository.findBySprint_SprintId(sprintId);

        // 1. Delete associated test cases for sprint tasks
        List<TestCase> testCases = testCaseRepository.findByTask_Sprint_SprintId(sprintId);
        if (!testCases.isEmpty()) {
            testCaseRepository.deleteAll(testCases);
            log.info("Deleted {} test cases for sprint id={}", testCases.size(), sprintId);
        }

        // 2. Delete associated issues for sprint tasks
        List<Issue> issues = issueRepository.findByTask_Sprint_SprintId(sprintId);
        if (!issues.isEmpty()) {
            issueRepository.deleteAll(issues);
            log.info("Deleted {} issues for sprint id={}", issues.size(), sprintId);
        }

        // 3. Delete associated AI suggestions for sprint tasks
        for (Task t : tasks) {
            List<AiSuggestion> suggestions = aiSuggestionRepository.findByTask_TaskIdOrderByGeneratedTimeDesc(t.getTaskId());
            if (!suggestions.isEmpty()) {
                aiSuggestionRepository.deleteAll(suggestions);
            }
        }

        // 4. Delete tasks belonging to sprint
        if (!tasks.isEmpty()) {
            taskRepository.deleteAll(tasks);
            log.info("Deleted {} tasks for sprint id={}", tasks.size(), sprintId);
        }

        // 5. Delete sprint
        sprintRepository.delete(sprint);
        log.info("Sprint deleted: id={}", sprintId);
    }

    private SprintResponse mapToResponse(Sprint sprint) {
        long totalTasks = taskRepository.countBySprint_SprintId(sprint.getSprintId());
        long completedTasks = taskRepository.countBySprint_SprintIdAndStatusIgnoreCase(sprint.getSprintId(), "Done");
        return SprintResponse.fromEntity(sprint, totalTasks, completedTasks);
    }
}
