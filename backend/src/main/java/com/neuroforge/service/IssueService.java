package com.neuroforge.service;

import com.neuroforge.dto.request.IssueCreateRequest;
import com.neuroforge.dto.request.IssueStatusUpdateRequest;
import com.neuroforge.dto.request.IssueUpdateRequest;
import com.neuroforge.dto.response.IssueResponse;
import com.neuroforge.dto.response.QaMetricsResponse;
import com.neuroforge.entity.Issue;
import com.neuroforge.entity.Project;
import com.neuroforge.entity.Task;
import com.neuroforge.entity.User;
import com.neuroforge.exception.ResourceNotFoundException;
import com.neuroforge.repository.IssueRepository;
import com.neuroforge.repository.ProjectRepository;
import com.neuroforge.repository.TaskRepository;
import com.neuroforge.repository.TestCaseRepository;
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
public class IssueService {

    private final IssueRepository issueRepository;
    private final TaskRepository taskRepository;
    private final TestCaseRepository testCaseRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public IssueResponse createIssue(Long reporterUserId, IssueCreateRequest request) {
        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", request.getTaskId()));

        User reportedBy = userRepository.findById(reporterUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", reporterUserId));

        User assignedTo = null;
        if (request.getAssignedToUserId() != null) {
            assignedTo = userRepository.findById(request.getAssignedToUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssignedToUserId()));
        } else {
            // Default: Assign to the developer assigned to the task
            assignedTo = task.getAssignedTo();
        }

        Issue issue = Issue.builder()
                .task(task)
                .reportedBy(reportedBy)
                .assignedTo(assignedTo)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .severity(request.getSeverity() != null && !request.getSeverity().trim().isEmpty() 
                        ? request.getSeverity().trim() : "Medium")
                .priority(request.getPriority() != null && !request.getPriority().trim().isEmpty() 
                        ? request.getPriority().trim() : "Medium")
                .status(request.getStatus() != null && !request.getStatus().trim().isEmpty() 
                        ? request.getStatus().trim() : "Open")
                .build();

        Issue saved = issueRepository.save(issue);
        log.info("Issue created: id={}, title={}, severity={}, reporter={}", 
                saved.getIssueId(), saved.getTitle(), saved.getSeverity(), reportedBy.getEmail());
        return IssueResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<IssueResponse> getIssuesByTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new ResourceNotFoundException("Task", "id", taskId);
        }

        return issueRepository.findByTask_TaskId(taskId)
                .stream()
                .map(IssueResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<IssueResponse> getIssuesByProject(Long projectId, String status, String severity) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project", "id", projectId);
        }

        List<Issue> issues;
        if (status != null && !status.trim().isEmpty()) {
            issues = issueRepository.findByTask_Sprint_Project_ProjectIdAndStatusIgnoreCase(projectId, status.trim());
        } else if (severity != null && !severity.trim().isEmpty()) {
            issues = issueRepository.findByTask_Sprint_Project_ProjectIdAndSeverityIgnoreCase(projectId, severity.trim());
        } else {
            issues = issueRepository.findByTask_Sprint_Project_ProjectId(projectId);
        }

        return issues.stream().map(IssueResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<IssueResponse> getMyReportedIssues(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }

        return issueRepository.findByReportedBy_UserId(userId)
                .stream()
                .map(IssueResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<IssueResponse> getMyAssignedIssues(Long userId, String status) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }

        List<Issue> issues;
        if (status != null && !status.trim().isEmpty()) {
            issues = issueRepository.findByAssignedTo_UserIdAndStatusIgnoreCase(userId, status.trim());
        } else {
            issues = issueRepository.findByAssignedTo_UserId(userId);
        }

        return issues.stream().map(IssueResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public IssueResponse getIssueById(Long issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));
        return IssueResponse.fromEntity(issue);
    }

    @Transactional
    public IssueResponse updateIssue(Long issueId, IssueUpdateRequest request) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));

        if (request.getAssignedToUserId() != null) {
            User assignedTo = userRepository.findById(request.getAssignedToUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssignedToUserId()));
            issue.setAssignedTo(assignedTo);
        }

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            issue.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            issue.setDescription(request.getDescription());
        }
        if (request.getSeverity() != null && !request.getSeverity().trim().isEmpty()) {
            issue.setSeverity(request.getSeverity().trim());
        }
        if (request.getPriority() != null && !request.getPriority().trim().isEmpty()) {
            issue.setPriority(request.getPriority().trim());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            issue.setStatus(request.getStatus().trim());
        }

        Issue updated = issueRepository.save(issue);
        log.info("Issue updated: id={}, status={}", issueId, updated.getStatus());
        return IssueResponse.fromEntity(updated);
    }

    @Transactional
    public IssueResponse updateIssueStatus(Long issueId, IssueStatusUpdateRequest request) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));

        issue.setStatus(request.getStatus().trim());
        Issue updated = issueRepository.save(issue);
        log.info("Issue status updated: id={}, status={}", issueId, updated.getStatus());
        return IssueResponse.fromEntity(updated);
    }

    @Transactional
    public IssueResponse assignIssue(Long issueId, Long newAssigneeId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));

        User newAssignee = userRepository.findById(newAssigneeId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", newAssigneeId));

        issue.setAssignedTo(newAssignee);
        Issue updated = issueRepository.save(issue);
        log.info("Issue reassigned: id={}, assignee={}", issueId, newAssignee.getEmail());
        return IssueResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteIssue(Long issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));

        issueRepository.delete(issue);
        log.info("Issue deleted: id={}", issueId);
    }

    @Transactional(readOnly = true)
    public QaMetricsResponse getProjectQaMetrics(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        long totalTests = testCaseRepository.countByTask_Sprint_Project_ProjectId(projectId);
        long passedTests = testCaseRepository.countByTask_Sprint_Project_ProjectIdAndStatusIgnoreCase(projectId, "Passed");
        long failedTests = testCaseRepository.countByTask_Sprint_Project_ProjectIdAndStatusIgnoreCase(projectId, "Failed");
        long pendingTests = totalTests - (passedTests + failedTests);

        double passRate = totalTests > 0 ? ((double) passedTests / totalTests) * 100.0 : 0.0;

        long totalIssues = issueRepository.countByTask_Sprint_Project_ProjectId(projectId);
        long openIssues = issueRepository.countByTask_Sprint_Project_ProjectIdAndStatusIgnoreCase(projectId, "Open");
        long criticalIssues = issueRepository.countByTask_Sprint_Project_ProjectIdAndSeverityIgnoreCase(projectId, "Critical");
        long resolvedIssues = issueRepository.countByTask_Sprint_Project_ProjectIdAndStatusIgnoreCase(projectId, "Resolved");

        return QaMetricsResponse.builder()
                .projectId(projectId)
                .projectName(project.getName())
                .totalTestCases(totalTests)
                .passedTestCases(passedTests)
                .failedTestCases(failedTests)
                .pendingTestCases(pendingTests)
                .passRatePercentage(Math.round(passRate * 100.0) / 100.0)
                .totalIssues(totalIssues)
                .openIssues(openIssues)
                .criticalIssues(criticalIssues)
                .resolvedIssues(resolvedIssues)
                .build();
    }
}
