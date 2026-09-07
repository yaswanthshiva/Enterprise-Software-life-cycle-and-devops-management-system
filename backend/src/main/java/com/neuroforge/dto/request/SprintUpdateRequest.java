package com.neuroforge.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintUpdateRequest {

    @Size(max = 150, message = "Sprint name cannot exceed 150 characters")
    private String sprintName;

    private String goal;

    private String status; // Planned, Active, Completed

    private LocalDate startDate;

    private LocalDate endDate;
}
