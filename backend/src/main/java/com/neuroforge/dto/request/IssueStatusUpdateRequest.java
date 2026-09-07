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
public class IssueStatusUpdateRequest {

    @NotBlank(message = "Status is required (e.g. 'Open', 'In Progress', 'Resolved', 'Closed', 'Reopened')")
    private String status;

    private String resolutionComment;
}
