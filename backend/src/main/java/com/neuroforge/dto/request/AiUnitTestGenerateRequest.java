package com.neuroforge.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiUnitTestGenerateRequest {

    private String sourceCode; // Optional if already in task context

    @Builder.Default
    private String testingFramework = "JUnit 5 + Mockito"; // JUnit 5 + Mockito, Jest + React Testing Library, PyTest

    @Builder.Default
    private Boolean includeEdgeCases = true;
}
