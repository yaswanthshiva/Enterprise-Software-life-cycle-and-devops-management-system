package com.neuroforge.dto.response;

import com.neuroforge.entity.Release;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReleaseResponse {

    private Long releaseId;
    private Long projectId;
    private String projectName;
    private String versionNumber;
    private String releaseName;
    private String releaseNotes;
    private String status;
    private LocalDate releaseDate;
    private Long createdByUserId;
    private String createdByName;
    private LocalDateTime createdAt;

    public static ReleaseResponse fromEntity(Release release) {
        return ReleaseResponse.builder()
                .releaseId(release.getReleaseId())
                .projectId(release.getProject().getProjectId())
                .projectName(release.getProject().getName())
                .versionNumber(release.getVersionNumber())
                .releaseName(release.getReleaseName())
                .releaseNotes(release.getReleaseNotes())
                .status(release.getStatus())
                .releaseDate(release.getReleaseDate())
                .createdByUserId(release.getCreatedBy().getUserId())
                .createdByName(release.getCreatedBy().getName())
                .createdAt(release.getCreatedAt())
                .build();
    }
}
