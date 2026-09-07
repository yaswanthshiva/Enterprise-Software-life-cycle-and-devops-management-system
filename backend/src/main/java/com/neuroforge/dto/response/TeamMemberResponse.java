package com.neuroforge.dto.response;

import com.neuroforge.entity.TeamMember;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberResponse {

    private Long teamId;
    private String teamName;
    private Long userId;
    private String userName;
    private String userEmail;
    private String platformRole;
    private String roleInTeam;
    private LocalDate joinedDate;

    public static TeamMemberResponse fromEntity(TeamMember member) {
        return TeamMemberResponse.builder()
                .teamId(member.getTeam() != null ? member.getTeam().getTeamId() : null)
                .teamName(member.getTeam() != null ? member.getTeam().getTeamName() : null)
                .userId(member.getUser() != null ? member.getUser().getUserId() : null)
                .userName(member.getUser() != null ? member.getUser().getName() : null)
                .userEmail(member.getUser() != null ? member.getUser().getEmail() : null)
                .platformRole(member.getUser() != null ? member.getUser().getRole() : null)
                .roleInTeam(member.getRoleInTeam())
                .joinedDate(member.getJoinedDate())
                .build();
    }
}
