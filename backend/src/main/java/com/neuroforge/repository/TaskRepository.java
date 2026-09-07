package com.neuroforge.repository;

import com.neuroforge.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findBySprint_SprintId(Long sprintId);

    List<Task> findBySprint_SprintIdAndStatusIgnoreCase(Long sprintId, String status);

    List<Task> findByAssignedTo_UserIdOrderByDueDateAsc(Long userId);

    List<Task> findByAssignedTo_UserIdAndStatusIgnoreCaseOrderByDueDateAsc(Long userId, String status);

    List<Task> findByStory_StoryId(Long storyId);

    List<Task> findBySprint_Project_ProjectId(Long projectId);

    long countBySprint_SprintId(Long sprintId);

    long countBySprint_SprintIdAndStatusIgnoreCase(Long sprintId, String status);
}
