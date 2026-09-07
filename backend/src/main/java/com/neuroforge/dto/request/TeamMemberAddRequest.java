package com.neuroforge.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberAddRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Role in team is required (e.g. Developer, Tester, Business Analyst, DevOps Engineer)")
    private String roleInTeam;
}
