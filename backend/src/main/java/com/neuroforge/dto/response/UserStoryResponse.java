package com.neuroforge.dto.response;

import com.neuroforge.entity.UserStory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStoryResponse {

    private Long storyId;
    private Long requirementId;
    private String requirementTitle;
    private Long projectId;
    private String projectName;
    private String storyTitle;
    private String acceptanceCriteria;
    private String priority;
    private Integer storyPoints;
    private String status;
    private LocalDateTime createdAt;

    public static UserStoryResponse fromEntity(UserStory story) {
        return UserStoryResponse.builder()
                .storyId(story.getStoryId())
                .requirementId(story.getRequirement() != null ? story.getRequirement().getRequirementId() : null)
                .requirementTitle(story.getRequirement() != null ? story.getRequirement().getTitle() : null)
                .projectId(story.getRequirement() != null && story.getRequirement().getProject() != null 
                        ? story.getRequirement().getProject().getProjectId() : null)
                .projectName(story.getRequirement() != null && story.getRequirement().getProject() != null 
                        ? story.getRequirement().getProject().getName() : null)
                .storyTitle(story.getStoryTitle())
                .acceptanceCriteria(story.getAcceptanceCriteria())
                .priority(story.getPriority())
                .storyPoints(story.getStoryPoints())
                .status(story.getStatus())
                .createdAt(story.getCreatedAt())
                .build();
    }
}
