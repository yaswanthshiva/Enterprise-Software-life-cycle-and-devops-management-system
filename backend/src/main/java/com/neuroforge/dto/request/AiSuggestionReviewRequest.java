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
public class AiSuggestionReviewRequest {

    @NotBlank(message = "Review status is required (e.g. 'Accepted', 'Rejected')")
    private String status;

    @Builder.Default
    private Boolean applyToBacklog = true; // If true and suggestion is user stories, automatically creates stories in database

    private String reviewerFeedback;
}
