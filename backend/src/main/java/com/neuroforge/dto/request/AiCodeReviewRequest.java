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
public class AiCodeReviewRequest {

    @NotBlank(message = "Source code is required for review")
    private String sourceCode;

    @Builder.Default
    private String language = "Java";

    @Builder.Default
    private String reviewFocus = "Security, Performance & Best Practices"; // e.g. "OWASP Security", "Time Complexity", "Clean Code"
}
