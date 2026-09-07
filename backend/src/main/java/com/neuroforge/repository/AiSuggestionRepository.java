package com.neuroforge.repository;

import com.neuroforge.entity.AiSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiSuggestionRepository extends JpaRepository<AiSuggestion, Long> {

    List<AiSuggestion> findByRequirement_RequirementIdOrderByGeneratedTimeDesc(Long requirementId);

    List<AiSuggestion> findByTask_TaskIdOrderByGeneratedTimeDesc(Long taskId);

    List<AiSuggestion> findByStatusOrderByGeneratedTimeDesc(String status);

    List<AiSuggestion> findByRequirement_Project_ProjectIdOrderByGeneratedTimeDesc(Long projectId);

    List<AiSuggestion> findByTask_Sprint_Project_ProjectIdOrderByGeneratedTimeDesc(Long projectId);
}
