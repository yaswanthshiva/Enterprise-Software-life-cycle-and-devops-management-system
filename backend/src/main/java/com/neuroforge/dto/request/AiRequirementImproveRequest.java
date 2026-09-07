package com.neuroforge.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiRequirementImproveRequest {

    private String focusArea; // e.g. "Security & Compliance", "Edge Cases", "Scalability", "Complete Overhaul"
    private String targetAudience; // e.g. "Enterprise Users", "Internal DevOps Engineers"
    private String customInstructions;
}
