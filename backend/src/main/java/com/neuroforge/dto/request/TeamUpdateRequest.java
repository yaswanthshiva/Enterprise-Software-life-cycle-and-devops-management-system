package com.neuroforge.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamUpdateRequest {

    @Size(min = 2, max = 100, message = "Team name must be between 2 and 100 characters")
    private String teamName;

    private String description;
}
