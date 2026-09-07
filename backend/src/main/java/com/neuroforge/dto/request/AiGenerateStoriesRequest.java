package com.neuroforge.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiGenerateStoriesRequest {

    @Builder.Default
    private Integer targetStoryCount = 3;

    private String estimationScale; // e.g. "Fibonacci", "T-Shirt"
    private String additionalContext;
}
