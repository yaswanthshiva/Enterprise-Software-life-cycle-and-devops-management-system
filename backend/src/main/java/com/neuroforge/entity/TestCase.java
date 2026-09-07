package com.neuroforge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "test_cases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "test_case_id")
    private Long testCaseId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "test_type", length = 50)
    @Builder.Default
    private String testType = "Functional"; // Functional, Regression, Integration, Security, Performance

    @Column(name = "steps", columnDefinition = "TEXT")
    private String steps;

    @Column(name = "expected_result", columnDefinition = "TEXT")
    private String expectedResult;

    @Column(name = "status", length = 50)
    @Builder.Default
    private String status = "Draft"; // Draft, Pending, Passed, Failed, Blocked

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "executed_by")
    private User executedBy;

    @Column(name = "execution_date")
    private LocalDateTime executionDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
