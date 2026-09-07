package com.neuroforge.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReleaseCreateRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotBlank(message = "Version number is required (e.g. v1.0.0)")
    private String versionNumber;

    private String releaseName;

    private String releaseNotes;

    @Builder.Default
    private String status = "Draft";

    private LocalDate releaseDate;
}
