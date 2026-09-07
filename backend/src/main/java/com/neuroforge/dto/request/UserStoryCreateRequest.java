package com.neuroforge.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStoryCreateRequest {

    @NotBlank(message = "Story title is required")
    @Size(min = 2, max = 200, message = "Story title must be between 2 and 200 characters")
    private String storyTitle;

    private String acceptanceCriteria;

    private String priority; // High, Medium, Low (default: Medium)

    @Min(value = 1, message = "Story points must be at least 1")
    private Integer storyPoints; // default: 3

    private String status; // Draft, Approved, In Progress, Completed (default: Draft)
}
