package com.neuroforge.service;

import com.neuroforge.dto.request.AiArchitectureRequest;
import com.neuroforge.dto.request.AiGenerateStoriesRequest;
import com.neuroforge.dto.request.AiRequirementImproveRequest;
import com.neuroforge.dto.request.AiSuggestionReviewRequest;
import com.neuroforge.dto.response.AiGeneratedStoryDto;
import com.neuroforge.dto.response.AiSuggestionResponse;
import com.neuroforge.entity.AiSuggestion;
import com.neuroforge.entity.Requirement;
import com.neuroforge.entity.User;
import com.neuroforge.entity.UserStory;
import com.neuroforge.exception.ResourceNotFoundException;
import com.neuroforge.repository.AiSuggestionRepository;
import com.neuroforge.repository.RequirementRepository;
import com.neuroforge.repository.UserRepository;
import com.neuroforge.repository.UserStoryRepository;
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
public class AiRequirementService {

    private final AiSuggestionRepository aiSuggestionRepository;
    private final RequirementRepository requirementRepository;
    private final UserStoryRepository userStoryRepository;
    private final UserRepository userRepository;
    private final AiService aiService;

    @Value("${neuroforge.ai.gemini.model:gemini-1.5-flash}")
    private String configuredModel;

    @Transactional
    public AiSuggestionResponse improveRequirement(Long requirementId, Long userId, AiRequirementImproveRequest request) {
        Requirement requirement = requirementRepository.findById(requirementId)
                .orElseThrow(() -> new ResourceNotFoundException("Requirement", "id", requirementId));

        String focusArea = request != null ? request.getFocusArea() : "Enterprise Readiness & Security";
        String targetAudience = request != null ? request.getTargetAudience() : "Engineering Team";
        String customInstructions = request != null ? request.getCustomInstructions() : "";

        String aiContent = aiService.generateRequirementImprovement(
                requirement.getTitle(),
                requirement.getDescription(),
                focusArea,
                targetAudience,
                customInstructions
        );

        AiSuggestion suggestion = AiSuggestion.builder()
                .requirement(requirement)
                .suggestionType("Requirement Analysis")
                .content(aiContent)
                .promptContext("Focus: " + focusArea + " | Audience: " + targetAudience)
                .modelName(configuredModel)
                .status("Pending Review")
                .build();

        AiSuggestion saved = aiSuggestionRepository.save(suggestion);
        log.info("AI Requirement Analysis generated: suggestionId={}, requirementId={}", saved.getSuggestionId(), requirementId);
        return AiSuggestionResponse.fromEntity(saved);
    }

    @Transactional
    public AiSuggestionResponse generateUserStories(Long requirementId, Long userId, AiGenerateStoriesRequest request) {
        Requirement requirement = requirementRepository.findById(requirementId)
                .orElseThrow(() -> new ResourceNotFoundException("Requirement", "id", requirementId));

        int targetCount = (request != null && request.getTargetStoryCount() != null && request.getTargetStoryCount() > 0)
                ? request.getTargetStoryCount() : 3;
        String context = request != null ? request.getAdditionalContext() : "";

        String aiContent = aiService.generateUserStories(
                requirement.getTitle(),
                requirement.getDescription(),
                targetCount,
                context
        );

        AiSuggestion suggestion = AiSuggestion.builder()
                .requirement(requirement)
                .suggestionType("User Story Generation")
                .content(aiContent)
                .promptContext("Target count: " + targetCount + (context != null && !context.isEmpty() ? " | Context: " + context : ""))
                .modelName(configuredModel)
                .status("Pending Review")
                .build();

        AiSuggestion saved = aiSuggestionRepository.save(suggestion);
        log.info("AI User Stories generated: suggestionId={}, requirementId={}, count={}", saved.getSuggestionId(), requirementId, targetCount);
        return AiSuggestionResponse.fromEntity(saved);
    }

    @Transactional
    public AiSuggestionResponse generateArchitectureDesign(Long requirementId, Long userId, AiArchitectureRequest request) {
        Requirement requirement = requirementRepository.findById(requirementId)
                .orElseThrow(() -> new ResourceNotFoundException("Requirement", "id", requirementId));

        String db = request != null ? request.getPreferredDatabase() : "MySQL / JPA";
        String deploy = request != null ? request.getDeploymentTarget() : "Docker / Kubernetes";
        String sec = request != null ? request.getSecurityLevel() : "High (JWT + RBAC)";

        String aiContent = aiService.generateArchitectureRecommendations(
                requirement.getTitle(),
                requirement.getDescription(),
                db,
                deploy,
                sec
        );

        AiSuggestion suggestion = AiSuggestion.builder()
                .requirement(requirement)
                .suggestionType("Architecture Design")
                .content(aiContent)
                .promptContext("DB: " + db + " | Deploy: " + deploy + " | Sec: " + sec)
                .modelName(configuredModel)
                .status("Pending Review")
                .build();

        AiSuggestion saved = aiSuggestionRepository.save(suggestion);
        log.info("AI Architecture Design generated: suggestionId={}, requirementId={}", saved.getSuggestionId(), requirementId);
        return AiSuggestionResponse.fromEntity(saved);
    }

    @Transactional
    public AiSuggestionResponse reviewSuggestion(Long suggestionId, Long reviewerId, AiSuggestionReviewRequest request) {
        AiSuggestion suggestion = aiSuggestionRepository.findById(suggestionId)
                .orElseThrow(() -> new ResourceNotFoundException("AiSuggestion", "id", suggestionId));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", reviewerId));

        suggestion.setReviewedBy(reviewer);
        suggestion.setStatus(request.getStatus().trim());

        // If suggestion is accepted and type is User Story Generation, automatically convert to backlog user stories
        if ("Accepted".equalsIgnoreCase(request.getStatus().trim())
                && Boolean.TRUE.equals(request.getApplyToBacklog())
                && "User Story Generation".equalsIgnoreCase(suggestion.getSuggestionType())
                && suggestion.getRequirement() != null) {

            List<AiGeneratedStoryDto> storyDtos = aiService.parseStoriesFromMarkdown(suggestion.getContent());
            for (AiGeneratedStoryDto dto : storyDtos) {
                UserStory story = UserStory.builder()
                        .requirement(suggestion.getRequirement())
                        .storyTitle(dto.getStoryTitle())
                        .acceptanceCriteria(dto.getAcceptanceCriteria())
                        .priority(dto.getPriority())
                        .storyPoints(dto.getStoryPoints())
                        .status("Approved")
                        .build();
                userStoryRepository.save(story);
                log.info("Auto-created UserStory from AI Suggestion: title={}, points={}", story.getStoryTitle(), story.getStoryPoints());
            }
        }

        AiSuggestion updated = aiSuggestionRepository.save(suggestion);
        log.info("AI Suggestion reviewed: id={}, status={}, reviewer={}", suggestionId, updated.getStatus(), reviewer.getEmail());
        return AiSuggestionResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public List<AiSuggestionResponse> getSuggestionsByRequirement(Long requirementId) {
        if (!requirementRepository.existsById(requirementId)) {
            throw new ResourceNotFoundException("Requirement", "id", requirementId);
        }

        return aiSuggestionRepository.findByRequirement_RequirementIdOrderByGeneratedTimeDesc(requirementId)
                .stream()
                .map(AiSuggestionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AiSuggestionResponse getSuggestionById(Long suggestionId) {
        AiSuggestion suggestion = aiSuggestionRepository.findById(suggestionId)
                .orElseThrow(() -> new ResourceNotFoundException("AiSuggestion", "id", suggestionId));
        return AiSuggestionResponse.fromEntity(suggestion);
    }
}
