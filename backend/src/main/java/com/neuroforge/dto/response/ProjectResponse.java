package com.neuroforge.dto.response;

import com.neuroforge.entity.Project;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {

    private Long projectId;
    private String name;
    private String description;
    private String status;
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private LocalDateTime createdDate;
    private LocalDateTime updatedAt;

    public static ProjectResponse fromEntity(Project project) {
        return ProjectResponse.builder()
                .projectId(project.getProjectId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .ownerId(project.getOwner() != null ? project.getOwner().getUserId() : null)
                .ownerName(project.getOwner() != null ? project.getOwner().getName() : null)
                .ownerEmail(project.getOwner() != null ? project.getOwner().getEmail() : null)
                .createdDate(project.getCreatedDate())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}
