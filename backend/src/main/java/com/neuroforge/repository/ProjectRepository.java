package com.neuroforge.repository;

import com.neuroforge.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByOwner_UserId(Long ownerId);

    List<Project> findByStatusIgnoreCase(String status);

    List<Project> findByStatusNotIgnoreCase(String status);
}
