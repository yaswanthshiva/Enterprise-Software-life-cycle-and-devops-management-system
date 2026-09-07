package com.neuroforge.repository;

import com.neuroforge.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {

    List<Sprint> findByProject_ProjectIdOrderByStartDateAsc(Long projectId);

    List<Sprint> findByProject_ProjectIdAndStatusIgnoreCase(Long projectId, String status);

    Optional<Sprint> findFirstByProject_ProjectIdAndStatusIgnoreCase(Long projectId, String status);

    Boolean existsByProject_ProjectIdAndStatusIgnoreCase(Long projectId, String status);
}
