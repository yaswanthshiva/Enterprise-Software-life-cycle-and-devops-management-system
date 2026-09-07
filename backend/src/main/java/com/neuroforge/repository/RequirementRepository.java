package com.neuroforge.repository;

import com.neuroforge.entity.Requirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequirementRepository extends JpaRepository<Requirement, Long> {

    List<Requirement> findByProject_ProjectId(Long projectId);

    List<Requirement> findByProject_ProjectIdAndStatusIgnoreCase(Long projectId, String status);

    List<Requirement> findByProject_ProjectIdAndPriorityIgnoreCase(Long projectId, String priority);
}
