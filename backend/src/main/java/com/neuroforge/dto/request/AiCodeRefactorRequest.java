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
public class AiCodeRefactorRequest {

    @NotBlank(message = "Source code is required for refactoring")
    private String sourceCode;

    @Builder.Default
    private String language = "Java";

    @Builder.Default
    private String refactorGoal = "SOLID Principles & Clean Code"; // e.g. "Performance Optimization", "Async/Reactive", "Design Patterns"
}
