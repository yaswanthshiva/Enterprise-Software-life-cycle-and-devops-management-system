package com.neuroforge.service;

import com.neuroforge.dto.request.ChangePasswordRequest;
import com.neuroforge.dto.request.LoginRequest;
import com.neuroforge.dto.request.RegisterRequest;
import com.neuroforge.dto.response.JwtResponse;
import com.neuroforge.dto.response.UserResponse;
import com.neuroforge.entity.Role;
import com.neuroforge.entity.User;
import com.neuroforge.exception.BadRequestException;
import com.neuroforge.exception.ResourceNotFoundException;
import com.neuroforge.repository.UserRepository;
import com.neuroforge.security.JwtUtils;
import com.neuroforge.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        Role roleEnum = Role.fromString(request.getRole());

        User user = User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(roleEnum.getDisplayName())
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("New user registered successfully: id={}, email={}, role={}", savedUser.getUserId(), savedUser.getEmail(), savedUser.getRole());

        return UserResponse.fromEntity(savedUser);
    }

    public JwtResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().trim().toLowerCase(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        log.info("User logged in successfully: email={}, role={}", userDetails.getEmail(), userDetails.getRole());

        return JwtResponse.builder()
                .token(jwt)
                .type("Bearer")
                .userId(userDetails.getUserId())
                .name(userDetails.getName())
                .email(userDetails.getEmail())
                .role(userDetails.getRole())
                .build();
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password updated successfully for userId: {}", userId);
    }
}
