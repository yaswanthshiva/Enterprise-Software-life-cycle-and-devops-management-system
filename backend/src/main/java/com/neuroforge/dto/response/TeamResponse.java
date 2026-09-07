package com.neuroforge.dto.response;

import com.neuroforge.entity.Team;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamResponse {

    private Long teamId;
    private Long projectId;
    private String projectName;
    private String teamName;
    private String description;
    private int memberCount;
    private LocalDateTime createdAt;

    public static TeamResponse fromEntity(Team team, int memberCount) {
        return TeamResponse.builder()
                .teamId(team.getTeamId())
                .projectId(team.getProject() != null ? team.getProject().getProjectId() : null)
                .projectName(team.getProject() != null ? team.getProject().getName() : null)
                .teamName(team.getTeamName())
                .description(team.getDescription())
                .memberCount(memberCount)
                .createdAt(team.getCreatedAt())
                .build();
    }
}
