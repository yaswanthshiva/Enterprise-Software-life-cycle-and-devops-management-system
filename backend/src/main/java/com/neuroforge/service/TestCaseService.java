package com.neuroforge.service;

import com.neuroforge.dto.request.TestCaseCreateRequest;
import com.neuroforge.dto.request.TestCaseExecuteRequest;
import com.neuroforge.dto.request.TestCaseUpdateRequest;
import com.neuroforge.dto.response.TestCaseResponse;
import com.neuroforge.entity.Task;
import com.neuroforge.entity.TestCase;
import com.neuroforge.entity.User;
import com.neuroforge.exception.ResourceNotFoundException;
import com.neuroforge.repository.ProjectRepository;
import com.neuroforge.repository.SprintRepository;
import com.neuroforge.repository.TaskRepository;
import com.neuroforge.repository.TestCaseRepository;
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
public class TestCaseService {

    private final TestCaseRepository testCaseRepository;
    private final TaskRepository taskRepository;
    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public TestCaseResponse createTestCase(TestCaseCreateRequest request) {
        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", request.getTaskId()));

        TestCase testCase = TestCase.builder()
                .task(task)
                .title(request.getTitle().trim())
                .testType(request.getTestType() != null && !request.getTestType().trim().isEmpty() 
                        ? request.getTestType().trim() : "Functional")
                .steps(request.getSteps())
                .expectedResult(request.getExpectedResult())
                .status(request.getStatus() != null && !request.getStatus().trim().isEmpty() 
                        ? request.getStatus().trim() : "Draft")
                .build();

        TestCase saved = testCaseRepository.save(testCase);
        log.info("TestCase created: id={}, title={}, taskId={}", saved.getTestCaseId(), saved.getTitle(), task.getTaskId());
        return TestCaseResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<TestCaseResponse> getTestCasesByTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new ResourceNotFoundException("Task", "id", taskId);
        }

        return testCaseRepository.findByTask_TaskId(taskId)
                .stream()
                .map(TestCaseResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TestCaseResponse> getTestCasesBySprint(Long sprintId) {
        if (!sprintRepository.existsById(sprintId)) {
            throw new ResourceNotFoundException("Sprint", "id", sprintId);
        }

        return testCaseRepository.findByTask_Sprint_SprintId(sprintId)
                .stream()
                .map(TestCaseResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TestCaseResponse> getTestCasesByProject(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project", "id", projectId);
        }

        return testCaseRepository.findByTask_Sprint_Project_ProjectId(projectId)
                .stream()
                .map(TestCaseResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TestCaseResponse getTestCaseById(Long testCaseId) {
        TestCase testCase = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new ResourceNotFoundException("TestCase", "id", testCaseId));
        return TestCaseResponse.fromEntity(testCase);
    }

    @Transactional
    public TestCaseResponse updateTestCase(Long testCaseId, TestCaseUpdateRequest request) {
        TestCase testCase = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new ResourceNotFoundException("TestCase", "id", testCaseId));

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            testCase.setTitle(request.getTitle().trim());
        }
        if (request.getTestType() != null && !request.getTestType().trim().isEmpty()) {
            testCase.setTestType(request.getTestType().trim());
        }
        if (request.getSteps() != null) {
            testCase.setSteps(request.getSteps());
        }
        if (request.getExpectedResult() != null) {
            testCase.setExpectedResult(request.getExpectedResult());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            testCase.setStatus(request.getStatus().trim());
        }

        TestCase updated = testCaseRepository.save(testCase);
        log.info("TestCase updated: id={}, status={}", testCaseId, updated.getStatus());
        return TestCaseResponse.fromEntity(updated);
    }

    @Transactional
    public TestCaseResponse executeTestCase(Long testCaseId, Long executorUserId, TestCaseExecuteRequest request) {
        TestCase testCase = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new ResourceNotFoundException("TestCase", "id", testCaseId));

        User executor = userRepository.findById(executorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", executorUserId));

        testCase.setStatus(request.getStatus().trim());
        testCase.setExecutedBy(executor);
        testCase.setExecutionDate(LocalDateTime.now());

        TestCase updated = testCaseRepository.save(testCase);
        log.info("TestCase executed: id={}, status={}, executedBy={}", testCaseId, updated.getStatus(), executor.getEmail());
        return TestCaseResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteTestCase(Long testCaseId) {
        TestCase testCase = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new ResourceNotFoundException("TestCase", "id", testCaseId));

        testCaseRepository.delete(testCase);
        log.info("TestCase deleted: id={}", testCaseId);
    }
}
