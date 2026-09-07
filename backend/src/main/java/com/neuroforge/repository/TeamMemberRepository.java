package com.neuroforge.repository;

import com.neuroforge.entity.TeamMember;
import com.neuroforge.entity.TeamMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, TeamMemberId> {

    List<TeamMember> findById_TeamId(Long teamId);

    List<TeamMember> findById_UserId(Long userId);

    boolean existsById_TeamIdAndId_UserId(Long teamId, Long userId);

    void deleteById_TeamIdAndId_UserId(Long teamId, Long userId);
}
