package com.neuroforge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiGeneratedStoryDto {

    private String storyTitle;
    private String acceptanceCriteria;
    private String priority;
    private Integer storyPoints;
}
