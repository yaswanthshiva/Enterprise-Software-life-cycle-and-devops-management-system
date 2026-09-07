package com.neuroforge.repository;

import com.neuroforge.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {

    List<Issue> findByTask_TaskId(Long taskId);

    List<Issue> findByTask_Sprint_SprintId(Long sprintId);

    List<Issue> findByTask_Sprint_Project_ProjectId(Long projectId);

    List<Issue> findByTask_Sprint_Project_ProjectIdAndStatusIgnoreCase(Long projectId, String status);

    List<Issue> findByTask_Sprint_Project_ProjectIdAndSeverityIgnoreCase(Long projectId, String severity);

    List<Issue> findByReportedBy_UserId(Long userId);

    List<Issue> findByAssignedTo_UserId(Long userId);

    List<Issue> findByAssignedTo_UserIdAndStatusIgnoreCase(Long userId, String status);

    long countByTask_Sprint_Project_ProjectId(Long projectId);

    long countByTask_Sprint_Project_ProjectIdAndStatusIgnoreCase(Long projectId, String status);

    long countByTask_Sprint_Project_ProjectIdAndSeverityIgnoreCase(Long projectId, String severity);

    long countByTask_Sprint_SprintIdAndStatusIgnoreCase(Long sprintId, String status);
}
