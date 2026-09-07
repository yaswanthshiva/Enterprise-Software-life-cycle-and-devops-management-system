package com.neuroforge.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCaseUpdateRequest {

    @Size(max = 200, message = "Test title cannot exceed 200 characters")
    private String title;

    private String testType;

    private String steps;

    private String expectedResult;

    private String status;
}
