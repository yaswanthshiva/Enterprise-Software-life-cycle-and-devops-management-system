package com.neuroforge.service;

import com.neuroforge.dto.request.TaskCreateRequest;
import com.neuroforge.dto.request.TaskUpdateRequest;
import com.neuroforge.dto.response.KanbanBoardResponse;
import com.neuroforge.dto.response.TaskResponse;
import com.neuroforge.entity.AiSuggestion;
import com.neuroforge.entity.Issue;
import com.neuroforge.entity.Sprint;
import com.neuroforge.entity.Task;
import com.neuroforge.entity.TestCase;
import com.neuroforge.entity.User;
import com.neuroforge.entity.UserStory;
import com.neuroforge.exception.ResourceNotFoundException;
import com.neuroforge.repository.AiSuggestionRepository;
import com.neuroforge.repository.IssueRepository;
import com.neuroforge.repository.SprintRepository;
import com.neuroforge.repository.TaskRepository;
import com.neuroforge.repository.TestCaseRepository;
import com.neuroforge.repository.UserRepository;
import com.neuroforge.repository.UserStoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private final TaskRepository taskRepository;
    private final SprintRepository sprintRepository;
    private final UserStoryRepository userStoryRepository;
    private final UserRepository userRepository;
    private final TestCaseRepository testCaseRepository;
    private final IssueRepository issueRepository;
    private final AiSuggestionRepository aiSuggestionRepository;

    @Transactional
    public TaskResponse createTask(TaskCreateRequest request) {
        Sprint sprint = sprintRepository.findById(request.getSprintId())
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", request.getSprintId()));

        User assignedTo = userRepository.findById(request.getAssignedToUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssignedToUserId()));

        UserStory story = null;
        if (request.getStoryId() != null) {
            story = userStoryRepository.findById(request.getStoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("UserStory", "id", request.getStoryId()));
        }

        Task task = Task.builder()
                .sprint(sprint)
                .story(story)
                .assignedTo(assignedTo)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .priority(request.getPriority() != null && !request.getPriority().trim().isEmpty() 
                        ? request.getPriority().trim() : "Medium")
                .status(request.getStatus() != null && !request.getStatus().trim().isEmpty() 
                        ? request.getStatus().trim() : "To Do")
                .dueDate(request.getDueDate())
                .build();

        Task saved = taskRepository.save(task);
        log.info("Task created: id={}, title={}, sprintId={}, assignedTo={}", 
                saved.getTaskId(), saved.getTitle(), sprint.getSprintId(), assignedTo.getEmail());
        return TaskResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksBySprint(Long sprintId, String status) {
        if (!sprintRepository.existsById(sprintId)) {
            throw new ResourceNotFoundException("Sprint", "id", sprintId);
        }

        List<Task> tasks;
        if (status != null && !status.trim().isEmpty()) {
            tasks = taskRepository.findBySprint_SprintIdAndStatusIgnoreCase(sprintId, status.trim());
        } else {
            tasks = taskRepository.findBySprint_SprintId(sprintId);
        }

        return tasks.stream().map(TaskResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByStory(Long storyId) {
        if (!userStoryRepository.existsById(storyId)) {
            throw new ResourceNotFoundException("UserStory", "id", storyId);
        }

        return taskRepository.findByStory_StoryId(storyId)
                .stream()
                .map(TaskResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getMyTasks(Long userId, String status) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }

        List<Task> tasks;
        if (status != null && !status.trim().isEmpty()) {
            tasks = taskRepository.findByAssignedTo_UserIdAndStatusIgnoreCaseOrderByDueDateAsc(userId, status.trim());
        } else {
            tasks = taskRepository.findByAssignedTo_UserIdOrderByDueDateAsc(userId);
        }

        return tasks.stream().map(TaskResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        return TaskResponse.fromEntity(task);
    }

    @Transactional
    public TaskResponse updateTask(Long taskId, TaskUpdateRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        if (request.getSprintId() != null) {
            Sprint sprint = sprintRepository.findById(request.getSprintId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", request.getSprintId()));
            task.setSprint(sprint);
        }

        if (request.getStoryId() != null) {
            UserStory story = userStoryRepository.findById(request.getStoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("UserStory", "id", request.getStoryId()));
            task.setStory(story);
        }

        if (request.getAssignedToUserId() != null) {
            User assignedTo = userRepository.findById(request.getAssignedToUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssignedToUserId()));
            task.setAssignedTo(assignedTo);
        }

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            task.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getPriority() != null && !request.getPriority().trim().isEmpty()) {
            task.setPriority(request.getPriority().trim());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            task.setStatus(request.getStatus().trim());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }

        Task updated = taskRepository.save(task);
        log.info("Task updated: id={}, status={}, assignee={}", 
                updated.getTaskId(), updated.getStatus(), updated.getAssignedTo().getEmail());
        return TaskResponse.fromEntity(updated);
    }

    @Transactional
    public TaskResponse updateTaskStatus(Long taskId, String status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        task.setStatus(status.trim());
        Task updated = taskRepository.save(task);
        log.info("Task status updated: id={}, status={}", taskId, status);
        return TaskResponse.fromEntity(updated);
    }

    @Transactional
    public TaskResponse assignTask(Long taskId, Long newAssigneeId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        User newAssignee = userRepository.findById(newAssigneeId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", newAssigneeId));

        task.setAssignedTo(newAssignee);
        Task updated = taskRepository.save(task);
        log.info("Task assigned: id={}, newAssignee={}", taskId, newAssignee.getEmail());
        return TaskResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public KanbanBoardResponse getKanbanBoard(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint", "id", sprintId));

        List<Task> allTasks = taskRepository.findBySprint_SprintId(sprintId);

        List<TaskResponse> todo = new ArrayList<>();
        List<TaskResponse> inProgress = new ArrayList<>();
        List<TaskResponse> inReview = new ArrayList<>();
        List<TaskResponse> done = new ArrayList<>();

        for (Task task : allTasks) {
            TaskResponse resp = TaskResponse.fromEntity(task);
            String status = task.getStatus() != null ? task.getStatus().trim().toLowerCase() : "to do";

            switch (status) {
                case "in progress":
                case "inprogress":
                    inProgress.add(resp);
                    break;
                case "in review":
                case "inreview":
                case "review":
                    inReview.add(resp);
                    break;
                case "done":
                case "completed":
                    done.add(resp);
                    break;
                case "to do":
                case "todo":
                default:
                    todo.add(resp);
                    break;
            }
        }

        return KanbanBoardResponse.builder()
                .sprintId(sprint.getSprintId())
                .sprintName(sprint.getSprintName())
                .sprintStatus(sprint.getStatus())
                .totalTasks((long) allTasks.size())
                .todoTasks(todo)
                .inProgressTasks(inProgress)
                .inReviewTasks(inReview)
                .doneTasks(done)
                .build();
    }

    @Transactional
    public void deleteTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        // 1. Delete associated test cases
        List<TestCase> testCases = testCaseRepository.findByTask_TaskId(taskId);
        if (!testCases.isEmpty()) {
            testCaseRepository.deleteAll(testCases);
            log.info("Deleted {} test cases for task id={}", testCases.size(), taskId);
        }

        // 2. Delete associated issues
        List<Issue> issues = issueRepository.findByTask_TaskId(taskId);
        if (!issues.isEmpty()) {
            issueRepository.deleteAll(issues);
            log.info("Deleted {} issues for task id={}", issues.size(), taskId);
        }

        // 3. Delete associated AI suggestions
        List<AiSuggestion> suggestions = aiSuggestionRepository.findByTask_TaskIdOrderByGeneratedTimeDesc(taskId);
        if (!suggestions.isEmpty()) {
            aiSuggestionRepository.deleteAll(suggestions);
            log.info("Deleted {} AI suggestions for task id={}", suggestions.size(), taskId);
        }

        // 4. Delete the task
        taskRepository.delete(task);
        log.info("Task deleted: id={}", taskId);
    }
}
