package com.neuroforge.service;

import com.neuroforge.dto.request.UserUpdateRequest;
import com.neuroforge.dto.response.UserResponse;
import com.neuroforge.entity.Role;
import com.neuroforge.entity.User;
import com.neuroforge.exception.ResourceNotFoundException;
import com.neuroforge.repository.UserRepository;
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
}
