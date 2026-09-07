package com.neuroforge.service;

import com.neuroforge.dto.request.AiCodeGenerateRequest;
import com.neuroforge.dto.request.AiCodeRefactorRequest;
import com.neuroforge.dto.request.AiCodeReviewRequest;
import com.neuroforge.dto.request.AiUnitTestGenerateRequest;
import com.neuroforge.dto.response.AiSuggestionResponse;
import com.neuroforge.entity.AiSuggestion;
import com.neuroforge.entity.Task;
import com.neuroforge.exception.ResourceNotFoundException;
import com.neuroforge.repository.AiSuggestionRepository;
import com.neuroforge.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiCodeService {

    private final AiSuggestionRepository aiSuggestionRepository;
    private final TaskRepository taskRepository;
    private final AiService aiService;

    @Value("${neuroforge.ai.gemini.model:gemini-1.5-flash}")
    private String configuredModel;

    @Transactional
    public AiSuggestionResponse generateTaskCode(Long taskId, Long userId, AiCodeGenerateRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        String language = request != null && request.getLanguage() != null ? request.getLanguage() : "Java";
        String framework = request != null && request.getFramework() != null ? request.getFramework() : "Spring Boot 3.3 / JPA";
        String extraReqs = request != null ? request.getSpecificRequirements() : "";
        boolean includeComments = request == null || Boolean.TRUE.equals(request.getIncludeComments());

        String storyTitle = task.getStory() != null ? task.getStory().getStoryTitle() : null;
        String storyCriteria = task.getStory() != null ? task.getStory().getAcceptanceCriteria() : null;

        String aiContent = aiService.generateTaskCode(
                task.getTitle(),
                task.getDescription(),
                storyTitle,
                storyCriteria,
                language,
                framework,
                extraReqs,
                includeComments
        );

        AiSuggestion suggestion = AiSuggestion.builder()
                .task(task)
                .suggestionType("Code Generation")
                .content(aiContent)
                .promptContext("Lang: " + language + " | Framework: " + framework)
                .modelName(configuredModel)
                .status("Pending Review")
                .build();

        AiSuggestion saved = aiSuggestionRepository.save(suggestion);
        log.info("AI Code Generation created: suggestionId={}, taskId={}", saved.getSuggestionId(), taskId);
        return AiSuggestionResponse.fromEntity(saved);
    }

    @Transactional
    public AiSuggestionResponse reviewCode(Long taskId, Long userId, AiCodeReviewRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        String language = request != null && request.getLanguage() != null ? request.getLanguage() : "Java";
        String reviewFocus = request != null && request.getReviewFocus() != null ? request.getReviewFocus() : "Security & Performance";

        String aiContent = aiService.reviewCodeSnippet(
                request.getSourceCode(),
                language,
                reviewFocus
        );

        AiSuggestion suggestion = AiSuggestion.builder()
                .task(task)
                .suggestionType("Code Review")
                .content(aiContent)
                .promptContext("Focus: " + reviewFocus + " | Lang: " + language)
                .modelName(configuredModel)
                .status("Pending Review")
                .build();

        AiSuggestion saved = aiSuggestionRepository.save(suggestion);
        log.info("AI Code Review created: suggestionId={}, taskId={}", saved.getSuggestionId(), taskId);
        return AiSuggestionResponse.fromEntity(saved);
    }

    @Transactional
    public AiSuggestionResponse generateUnitTests(Long taskId, Long userId, AiUnitTestGenerateRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        String testFramework = request != null && request.getTestingFramework() != null 
                ? request.getTestingFramework() : "JUnit 5 + Mockito";
        boolean includeEdgeCases = request == null || Boolean.TRUE.equals(request.getIncludeEdgeCases());
        String sourceCode = request != null ? request.getSourceCode() : null;

        String aiContent = aiService.generateUnitTests(
                task.getTitle(),
                task.getDescription(),
                sourceCode,
                testFramework,
                includeEdgeCases
        );

        AiSuggestion suggestion = AiSuggestion.builder()
                .task(task)
                .suggestionType("Unit Test Generation")
                .content(aiContent)
                .promptContext("Framework: " + testFramework + " | EdgeCases: " + includeEdgeCases)
                .modelName(configuredModel)
                .status("Pending Review")
                .build();

        AiSuggestion saved = aiSuggestionRepository.save(suggestion);
        log.info("AI Unit Test created: suggestionId={}, taskId={}", saved.getSuggestionId(), taskId);
        return AiSuggestionResponse.fromEntity(saved);
    }

    @Transactional
    public AiSuggestionResponse refactorCode(Long taskId, Long userId, AiCodeRefactorRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        String language = request != null && request.getLanguage() != null ? request.getLanguage() : "Java";
        String refactorGoal = request != null && request.getRefactorGoal() != null 
                ? request.getRefactorGoal() : "SOLID Principles & Clean Code";

        String aiContent = aiService.refactorCodeSnippet(
                request.getSourceCode(),
                language,
                refactorGoal
        );

        AiSuggestion suggestion = AiSuggestion.builder()
                .task(task)
                .suggestionType("Code Refactoring")
                .content(aiContent)
                .promptContext("Goal: " + refactorGoal + " | Lang: " + language)
                .modelName(configuredModel)
                .status("Pending Review")
                .build();

        AiSuggestion saved = aiSuggestionRepository.save(suggestion);
        log.info("AI Code Refactoring created: suggestionId={}, taskId={}", saved.getSuggestionId(), taskId);
        return AiSuggestionResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<AiSuggestionResponse> getSuggestionsByTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new ResourceNotFoundException("Task", "id", taskId);
        }

        return aiSuggestionRepository.findByTask_TaskIdOrderByGeneratedTimeDesc(taskId)
                .stream()
                .map(AiSuggestionResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
