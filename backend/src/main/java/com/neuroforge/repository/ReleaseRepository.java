package com.neuroforge.repository;

import com.neuroforge.entity.Release;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReleaseRepository extends JpaRepository<Release, Long> {

    List<Release> findByProject_ProjectId(Long projectId);

    List<Release> findByProject_ProjectIdAndStatusIgnoreCase(Long projectId, String status);

    Optional<Release> findByProject_ProjectIdAndVersionNumberIgnoreCase(Long projectId, String versionNumber);

    boolean existsByProject_ProjectIdAndVersionNumberIgnoreCase(Long projectId, String versionNumber);

    List<Release> findByProject_ProjectIdOrderByCreatedAtDesc(Long projectId);
}
