package com.neuroforge.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCaseExecuteRequest {

    @NotBlank(message = "Execution status is required (e.g. 'Passed', 'Failed', 'Blocked')")
    private String status; // Passed, Failed, Blocked

    private String executionNotes;
}
