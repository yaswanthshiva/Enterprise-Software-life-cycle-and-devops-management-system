package com.neuroforge.repository;

import com.neuroforge.entity.Deployment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeploymentRepository extends JpaRepository<Deployment, Long> {

    List<Deployment> findByProject_ProjectId(Long projectId);

    List<Deployment> findByRelease_ReleaseId(Long releaseId);

    List<Deployment> findByProject_ProjectIdAndEnvironmentIgnoreCase(Long projectId, String environment);

    List<Deployment> findByProject_ProjectIdAndStatusIgnoreCase(Long projectId, String status);

    List<Deployment> findByDeployedBy_UserId(Long userId);

    List<Deployment> findByRelease_ReleaseIdAndEnvironmentIgnoreCase(Long releaseId, String environment);

    long countByProject_ProjectId(Long projectId);

    long countByProject_ProjectIdAndStatusIgnoreCase(Long projectId, String status);

    long countByProject_ProjectIdAndEnvironmentIgnoreCase(Long projectId, String environment);

    List<Deployment> findByProject_ProjectIdOrderByCreatedAtDesc(Long projectId);
}
