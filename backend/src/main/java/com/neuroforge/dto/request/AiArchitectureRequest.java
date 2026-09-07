package com.neuroforge.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiArchitectureRequest {

    private String preferredDatabase; // e.g. "MySQL / PostgreSQL", "MongoDB", "Redis"
    private String deploymentTarget; // e.g. "Docker / Kubernetes", "AWS ECS", "Serverless"
    private String securityLevel; // e.g. "High / OAuth2 + RBAC + Audit Logging"
    private String specificQuestions;
}
