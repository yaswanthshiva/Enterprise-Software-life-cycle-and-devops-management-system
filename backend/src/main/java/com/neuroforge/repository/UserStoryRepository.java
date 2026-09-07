package com.neuroforge.repository;

import com.neuroforge.entity.UserStory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserStoryRepository extends JpaRepository<UserStory, Long> {

    List<UserStory> findByRequirement_RequirementId(Long requirementId);

    List<UserStory> findByRequirement_Project_ProjectId(Long projectId);

    List<UserStory> findByRequirement_Project_ProjectIdAndStatusIgnoreCase(Long projectId, String status);
}
