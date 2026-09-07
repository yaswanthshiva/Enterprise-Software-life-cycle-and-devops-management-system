package com.neuroforge.dto.response;

import com.neuroforge.entity.Requirement;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequirementResponse {

    private Long requirementId;
    private Long projectId;
    private String projectName;
    private String title;
    private String description;
    private String priority;
    private String status;
    private Long createdById;
    private String createdByName;
    private int userStoryCount;
    private LocalDateTime createdAt;

    public static RequirementResponse fromEntity(Requirement requirement, int userStoryCount) {
        return RequirementResponse.builder()
                .requirementId(requirement.getRequirementId())
                .projectId(requirement.getProject() != null ? requirement.getProject().getProjectId() : null)
                .projectName(requirement.getProject() != null ? requirement.getProject().getName() : null)
                .title(requirement.getTitle())
                .description(requirement.getDescription())
                .priority(requirement.getPriority())
                .status(requirement.getStatus())
                .createdById(requirement.getCreatedBy() != null ? requirement.getCreatedBy().getUserId() : null)
                .createdByName(requirement.getCreatedBy() != null ? requirement.getCreatedBy().getName() : null)
                .userStoryCount(userStoryCount)
                .createdAt(requirement.getCreatedAt())
                .build();
    }
}
