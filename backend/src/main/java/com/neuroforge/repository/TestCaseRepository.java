package com.neuroforge.repository;

import com.neuroforge.entity.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, Long> {

    List<TestCase> findByTask_TaskId(Long taskId);

    List<TestCase> findByTask_Sprint_SprintId(Long sprintId);

    List<TestCase> findByTask_Sprint_Project_ProjectId(Long projectId);

    List<TestCase> findByStatusIgnoreCase(String status);

    long countByTask_Sprint_Project_ProjectId(Long projectId);

    long countByTask_Sprint_Project_ProjectIdAndStatusIgnoreCase(Long projectId, String status);

    long countByTask_Sprint_SprintId(Long sprintId);

    long countByTask_Sprint_SprintIdAndStatusIgnoreCase(Long sprintId, String status);
}
