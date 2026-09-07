package com.neuroforge.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiCodeGenerateRequest {

    @Builder.Default
    private String language = "Java"; // Java, TypeScript, Python, Go, SQL

    @Builder.Default
    private String framework = "Spring Boot 3.3 / JPA"; // Spring Boot, React, Node.js, Next.js

    private String specificRequirements;

    @Builder.Default
    private Boolean includeComments = true;
}
