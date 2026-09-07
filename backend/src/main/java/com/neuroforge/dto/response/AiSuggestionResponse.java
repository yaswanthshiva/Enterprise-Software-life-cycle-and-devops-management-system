package com.neuroforge.dto.response;

import com.neuroforge.entity.AiSuggestion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiSuggestionResponse {

    private Long suggestionId;
    private Long requirementId;
    private String requirementTitle;
    private Long taskId;
    private String taskTitle;
    private String suggestionType;
    private String content;
    private String promptContext;
    private String modelName;
    private Long reviewedById;
    private String reviewedByName;
    private LocalDateTime generatedTime;
    private String status;

    public static AiSuggestionResponse fromEntity(AiSuggestion entity) {
        if (entity == null) return null;

        return AiSuggestionResponse.builder()
                .suggestionId(entity.getSuggestionId())
                .requirementId(entity.getRequirement() != null ? entity.getRequirement().getRequirementId() : null)
                .requirementTitle(entity.getRequirement() != null ? entity.getRequirement().getTitle() : null)
                .taskId(entity.getTask() != null ? entity.getTask().getTaskId() : null)
                .taskTitle(entity.getTask() != null ? entity.getTask().getTitle() : null)
                .suggestionType(entity.getSuggestionType())
                .content(entity.getContent())
                .promptContext(entity.getPromptContext())
                .modelName(entity.getModelName())
                .reviewedById(entity.getReviewedBy() != null ? entity.getReviewedBy().getUserId() : null)
                .reviewedByName(entity.getReviewedBy() != null ? entity.getReviewedBy().getName() : null)
                .generatedTime(entity.getGeneratedTime())
                .status(entity.getStatus())
                .build();
    }
}
