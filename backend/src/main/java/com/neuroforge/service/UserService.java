package com.neuroforge.service;

import com.neuroforge.dto.request.UserUpdateRequest;
import com.neuroforge.dto.response.UserResponse;
import com.neuroforge.entity.Issue;
import com.neuroforge.entity.Project;
import com.neuroforge.entity.Role;
import com.neuroforge.entity.Task;
import com.neuroforge.entity.TeamMember;
import com.neuroforge.entity.User;
import com.neuroforge.exception.BadRequestException;
import com.neuroforge.exception.ResourceNotFoundException;
import com.neuroforge.repository.IssueRepository;
import com.neuroforge.repository.ProjectRepository;
import com.neuroforge.repository.TaskRepository;
import com.neuroforge.repository.TeamMemberRepository;
import com.neuroforge.repository.UserRepository;
import com.neuroforge.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final IssueRepository issueRepository;

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return UserResponse.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return UserResponse.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers(String roleFilter) {
        List<User> users;
        if (roleFilter != null && !roleFilter.trim().isEmpty()) {
            Role roleEnum = Role.fromString(roleFilter.trim());
            users = userRepository.findByRoleIgnoreCase(roleEnum.getDisplayName());
        } else {
            users = userRepository.findAll();
        }
        return users.stream().map(UserResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getActiveUsers() {
        return userRepository.findByIsActiveTrue()
                .stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }

        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            Role roleEnum = Role.fromString(request.getRole());
            user.setRole(roleEnum.getDisplayName());
        }

        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }

        User updatedUser = userRepository.save(user);
        log.info("User updated: id={}, name={}, role={}, isActive={}", updatedUser.getUserId(), updatedUser.getName(), updatedUser.getRole(), updatedUser.getIsActive());
        return UserResponse.fromEntity(updatedUser);
    }

    @Transactional
    public UserResponse toggleUserStatus(Long userId, Boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setIsActive(Boolean.TRUE.equals(isActive));
        User savedUser = userRepository.save(user);
        log.info("User status toggled: userId={}, isActive={}", userId, savedUser.getIsActive());
        return UserResponse.fromEntity(savedUser);
    }

    @Transactional
    public void deleteUser(UserDetailsImpl currentUser, Long userId) {
        if (currentUser != null && currentUser.getUserId().equals(userId)) {
            throw new BadRequestException("Security Constraint: You cannot delete your own active administrator account.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // 1. Remove team memberships
        List<TeamMember> memberships = teamMemberRepository.findById_UserId(userId);
        if (!memberships.isEmpty()) {
            teamMemberRepository.deleteAll(memberships);
            log.info("Removed {} team memberships for user id={}", memberships.size(), userId);
        }

        // 2. Reassign projects owned by this user to the executing administrator
        if (currentUser != null) {
            User adminUser = userRepository.findById(currentUser.getUserId()).orElse(null);
            if (adminUser != null) {
                List<Project> ownedProjects = projectRepository.findByOwner_UserId(userId);
                if (!ownedProjects.isEmpty()) {
                    for (Project p : ownedProjects) {
                        p.setOwner(adminUser);
                    }
                    projectRepository.saveAll(ownedProjects);
                    log.info("Reassigned {} projects to administrator id={}", ownedProjects.size(), adminUser.getUserId());
                }

                // 3. Reassign active tasks assigned to this user to the administrator
                List<Task> assignedTasks = taskRepository.findByAssignedTo_UserIdOrderByDueDateAsc(userId);
                if (!assignedTasks.isEmpty()) {
                    for (Task t : assignedTasks) {
                        t.setAssignedTo(adminUser);
                    }
                    taskRepository.saveAll(assignedTasks);
                    log.info("Reassigned {} tasks to administrator id={}", assignedTasks.size(), adminUser.getUserId());
                }

                // 4. Reassign issues reported by this user to the administrator
                List<Issue> reportedIssues = issueRepository.findByReportedBy_UserId(userId);
                if (!reportedIssues.isEmpty()) {
                    for (Issue i : reportedIssues) {
                        i.setReportedBy(adminUser);
                    }
                    issueRepository.saveAll(reportedIssues);
                    log.info("Reassigned {} reported issues to administrator id={}", reportedIssues.size(), adminUser.getUserId());
                }
            }
        }

        // 5. Unlink issues assigned to this user
        List<Issue> assignedIssues = issueRepository.findByAssignedTo_UserId(userId);
        if (!assignedIssues.isEmpty()) {
            for (Issue i : assignedIssues) {
                i.setAssignedTo(null);
            }
            issueRepository.saveAll(assignedIssues);
        }

        // 6. Delete user
        userRepository.delete(user);
        log.info("User permanently deleted: id={}, email={}", userId, user.getEmail());
    }
}
