package com.neuroforge.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCaseCreateRequest {

    @NotNull(message = "Task ID is required")
    private Long taskId;

    @NotBlank(message = "Test case title is required")
    @Size(max = 200, message = "Test title cannot exceed 200 characters")
    private String title;

    @Builder.Default
    private String testType = "Functional"; // Functional, Regression, Integration, Security, Performance

    private String steps;

    private String expectedResult;

    @Builder.Default
    private String status = "Draft"; // Draft, Pending, Passed, Failed, Blocked
}
