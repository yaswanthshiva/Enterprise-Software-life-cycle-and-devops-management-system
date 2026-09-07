package com.neuroforge.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReleaseUpdateRequest {

    private String releaseName;
    private String releaseNotes;
    private String status;
    private LocalDate releaseDate;
}
