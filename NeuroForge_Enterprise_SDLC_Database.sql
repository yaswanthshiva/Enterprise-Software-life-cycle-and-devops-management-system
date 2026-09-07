-- ============================================================
-- NEUROFORGE ENTERPRISE SDLC PLATFORM
-- Enterprise Database Schema & Seed Data
-- ============================================================

CREATE DATABASE IF NOT EXISTS neuroforge_enterprise_sdlc;

USE neuroforge_enterprise_sdlc;

-- Drop tables in reverse dependency order if needed for clean setup
DROP TABLE IF EXISTS issues;

DROP TABLE IF EXISTS test_cases;

DROP TABLE IF EXISTS ai_suggestions;

DROP TABLE IF EXISTS deployments;

DROP TABLE IF EXISTS releases;

DROP TABLE IF EXISTS tasks;

DROP TABLE IF EXISTS user_stories;

DROP TABLE IF EXISTS sprints;

DROP TABLE IF EXISTS requirements;

DROP TABLE IF EXISTS team_members;

DROP TABLE IF EXISTS teams;

DROP TABLE IF EXISTS projects;

DROP TABLE IF EXISTS users;

-- ============================================================
-- 1. USERS TABLE (Core Identity & RBAC)
-- ============================================================
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
);

-- ============================================================
-- 2. PROJECTS TABLE (Project Management & Ownership)
-- ============================================================
CREATE TABLE projects (
    project_id BIGINT AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    owner_id BIGINT NOT NULL,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id),
    FOREIGN KEY (owner_id) REFERENCES users (user_id)
);

-- ============================================================
-- 3. TEAMS TABLE (Team Structure)
-- ============================================================
CREATE TABLE teams (
    team_id BIGINT AUTO_INCREMENT,
    project_id BIGINT NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id),
    FOREIGN KEY (project_id) REFERENCES projects (project_id)
);

-- ============================================================
-- 4. TEAM MEMBERS TABLE (Membership / Weak Entity)
-- ============================================================
CREATE TABLE team_members (
    team_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role_in_team VARCHAR(50) NOT NULL,
    joined_date DATE DEFAULT(CURRENT_DATE),
    PRIMARY KEY (team_id, user_id),
    FOREIGN KEY (team_id) REFERENCES teams (team_id),
    FOREIGN KEY (user_id) REFERENCES users (user_id)
);

-- ============================================================
-- 5. REQUIREMENTS TABLE (Requirement Engineering)
-- ============================================================
CREATE TABLE requirements (
    requirement_id BIGINT AUTO_INCREMENT,
    project_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(30),
    status VARCHAR(50),
    created_by BIGINT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (requirement_id),
    FOREIGN KEY (project_id) REFERENCES projects (project_id),
    FOREIGN KEY (created_by) REFERENCES users (user_id)
);

-- ============================================================
-- 6. USER STORIES TABLE (Agile Backlog Management)
-- ============================================================
CREATE TABLE user_stories (
    story_id BIGINT AUTO_INCREMENT,
    requirement_id BIGINT NOT NULL,
    story_title VARCHAR(200) NOT NULL,
    acceptance_criteria TEXT,
    priority VARCHAR(30) DEFAULT 'Medium',
    story_points INT DEFAULT 3,
    status VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (story_id),
    FOREIGN KEY (requirement_id) REFERENCES requirements (requirement_id)
);

-- ============================================================
-- 7. SPRINTS TABLE (Sprint Planning & Lifecycle)
-- ============================================================
CREATE TABLE sprints (
    sprint_id BIGINT AUTO_INCREMENT,
    project_id BIGINT NOT NULL,
    sprint_name VARCHAR(150) NOT NULL,
    goal TEXT,
    status VARCHAR(50) DEFAULT 'Planned',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (sprint_id),
    FOREIGN KEY (project_id) REFERENCES projects (project_id)
);

-- ============================================================
-- 8. TASKS TABLE (Development Tasks & Work Breakdown)
-- ============================================================
CREATE TABLE tasks (
    task_id BIGINT AUTO_INCREMENT,
    sprint_id BIGINT NOT NULL,
    story_id BIGINT NULL,
    assigned_to BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(30) DEFAULT 'Medium',
    status VARCHAR(50),
    due_date DATE NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id),
    FOREIGN KEY (sprint_id) REFERENCES sprints (sprint_id),
    FOREIGN KEY (story_id) REFERENCES user_stories (story_id),
    FOREIGN KEY (assigned_to) REFERENCES users (user_id)
);

-- ============================================================
-- 9. RELEASES TABLE (Version Control & Release Notes)
-- ============================================================
CREATE TABLE releases (
    release_id BIGINT AUTO_INCREMENT,
    project_id BIGINT NOT NULL,
    version_number VARCHAR(30) NOT NULL,
    release_date DATE,
    release_notes TEXT,
    status VARCHAR(50) DEFAULT 'Planned',
    created_by BIGINT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (release_id),
    FOREIGN KEY (project_id) REFERENCES projects (project_id),
    FOREIGN KEY (created_by) REFERENCES users (user_id),
    CONSTRAINT uk_project_release UNIQUE (project_id, version_number)
);

-- ============================================================
-- 10. DEPLOYMENTS TABLE (CI/CD & Environment Tracking)
-- ============================================================
CREATE TABLE deployments (
    deployment_id BIGINT AUTO_INCREMENT,
    project_id BIGINT NOT NULL,
    release_id BIGINT NULL,
    deployed_by BIGINT NULL,
    environment VARCHAR(50),
    deployment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50),
    PRIMARY KEY (deployment_id),
    FOREIGN KEY (project_id) REFERENCES projects (project_id),
    FOREIGN KEY (release_id) REFERENCES releases (release_id),
    FOREIGN KEY (deployed_by) REFERENCES users (user_id)
);

-- ============================================================
-- 11. AI SUGGESTIONS TABLE (AI Telemetry & Traceability)
-- ============================================================
CREATE TABLE ai_suggestions (
    suggestion_id BIGINT AUTO_INCREMENT,
    requirement_id BIGINT NULL,
    task_id BIGINT NULL,
    suggestion_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    prompt_context TEXT NULL,
    model_name VARCHAR(100) DEFAULT 'gemini-1.5-pro',
    reviewed_by BIGINT NULL,
    generated_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50),
    PRIMARY KEY (suggestion_id),
    FOREIGN KEY (requirement_id) REFERENCES requirements (requirement_id),
    FOREIGN KEY (task_id) REFERENCES tasks (task_id),
    FOREIGN KEY (reviewed_by) REFERENCES users (user_id),
    CHECK (
        (
            requirement_id IS NOT NULL
            AND task_id IS NULL
        )
        OR (
            requirement_id IS NULL
            AND task_id IS NOT NULL
        )
    )
);

-- ============================================================
-- 12. TEST CASES TABLE (QA Management & Execution)
-- ============================================================
CREATE TABLE test_cases (
    test_case_id BIGINT AUTO_INCREMENT,
    task_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    test_type VARCHAR(50) DEFAULT 'Functional',
    steps TEXT,
    expected_result TEXT,
    status VARCHAR(50),
    executed_by BIGINT NULL,
    execution_date DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (test_case_id),
    FOREIGN KEY (task_id) REFERENCES tasks (task_id),
    FOREIGN KEY (executed_by) REFERENCES users (user_id)
);

-- ============================================================
-- 13. ISSUES TABLE (Bug Tracking & Incident Management)
-- ============================================================
CREATE TABLE issues (
    issue_id BIGINT AUTO_INCREMENT,
    task_id BIGINT NOT NULL,
    reported_by BIGINT NOT NULL,
    assigned_to BIGINT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    severity VARCHAR(30),
    priority VARCHAR(30) DEFAULT 'Medium',
    status VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (issue_id),
    FOREIGN KEY (task_id) REFERENCES tasks (task_id),
    FOREIGN KEY (reported_by) REFERENCES users (user_id),
    FOREIGN KEY (assigned_to) REFERENCES users (user_id)
);

-- ============================================================
-- SAMPLE DATA INSERTION (VALIDATION DATASET)
-- ============================================================

-- 1. Insert Users (All 5 Core SDLC Roles)
INSERT INTO
    users (
        name,
        email,
        password,
        role,
        is_active
    )
VALUES (
        'Rahul Sharma',
        'rahul@neuroforge.com',
        'Rahul@123',
        'Project Manager',
        TRUE
    ),
    (
        'Anjali Rao',
        'anjali@neuroforge.com',
        'Anjali@123',
        'Business Analyst',
        TRUE
    ),
    (
        'Arjun Kumar',
        'arjun@neuroforge.com',
        'Arjun@123',
        'Developer',
        TRUE
    ),
    (
        'Priya Singh',
        'priya@neuroforge.com',
        'Priya@123',
        'Tester',
        TRUE
    ),
    (
        'Vikram Patel',
        'vikram@neuroforge.com',
        'Vikram@123',
        'DevOps Engineer',
        TRUE
    );

-- 2. Insert Projects
INSERT INTO
    projects (
        name,
        description,
        status,
        owner_id
    )
VALUES (
        'NeuroForge SDLC Platform',
        'AI-powered enterprise software development lifecycle management platform.',
        'Active',
        1
    ),
    (
        'Smart Project Automation',
        'Automated project planning, development, testing, and deployment system.',
        'Planning',
        1
    );

-- 3. Insert Teams
INSERT INTO
    teams (
        project_id,
        team_name,
        description
    )
VALUES (
        1,
        'Development Team',
        'Team responsible for implementing application features.'
    ),
    (
        1,
        'Testing Team',
        'Team responsible for software testing and quality assurance.'
    ),
    (
        2,
        'Automation Team',
        'Team responsible for project automation and deployment.'
    );

-- 4. Insert Team Members
INSERT INTO
    team_members (
        team_id,
        user_id,
        role_in_team,
        joined_date
    )
VALUES (
        1,
        3,
        'Developer',
        '2026-08-11'
    ),
    (
        1,
        2,
        'Business Analyst',
        '2026-08-11'
    ),
    (
        1,
        5,
        'DevOps Engineer',
        '2026-08-11'
    ),
    (2, 4, 'Tester', '2026-08-11'),
    (
        3,
        3,
        'Developer',
        '2026-08-11'
    ),
    (
        3,
        5,
        'DevOps Engineer',
        '2026-08-11'
    );

-- 5. Insert Requirements
INSERT INTO
    requirements (
        project_id,
        title,
        description,
        priority,
        status,
        created_by
    )
VALUES (
        1,
        'User Authentication',
        'The system shall allow users to securely log in and access the platform based on their roles.',
        'High',
        'Approved',
        2
    ),
    (
        1,
        'AI Requirement Analysis',
        'The system shall analyze business requirements using NLP and generate relevant user stories and architecture suggestions.',
        'High',
        'Approved',
        2
    ),
    (
        1,
        'AI Code Assistance',
        'The system shall provide developers with AI-generated code suggestions based on assigned development tasks.',
        'High',
        'In Progress',
        2
    ),
    (
        2,
        'Automated Deployment',
        'The system shall automate application build and deployment through a CI/CD pipeline.',
        'Medium',
        'Draft',
        2
    );

-- 6. Insert User Stories
INSERT INTO
    user_stories (
        requirement_id,
        story_title,
        acceptance_criteria,
        priority,
        story_points,
        status
    )
VALUES (
        1,
        'Secure User Login',
        'User can log in with valid credentials and access features according to their role.',
        'High',
        5,
        'Approved'
    ),
    (
        2,
        'AI Requirement Analysis',
        'Business requirements are analyzed and the AI generates relevant user stories and architecture suggestions.',
        'High',
        8,
        'Approved'
    ),
    (
        3,
        'AI Code Assistance',
        'Developer can request, review, and use an AI-generated code suggestion for an assigned task.',
        'High',
        8,
        'In Progress'
    ),
    (
        4,
        'Automated Application Deployment',
        'The application can be built and deployed through the CI/CD pipeline after sprint tasks are completed.',
        'Medium',
        5,
        'Draft'
    );

-- 7. Insert Sprints
INSERT INTO
    sprints (
        project_id,
        sprint_name,
        goal,
        status,
        start_date,
        end_date
    )
VALUES (
        1,
        'Sprint 1 - Requirement and Architecture',
        'Establish core auth, architecture models, and AI requirement tools.',
        'Completed',
        '2026-08-11',
        '2026-08-18'
    ),
    (
        1,
        'Sprint 2 - Development and Testing',
        'Implement AI code assistance, task workflows, and testing suite.',
        'Active',
        '2026-08-19',
        '2026-08-26'
    ),
    (
        2,
        'Sprint 1 - Automation',
        'Setup CI/CD automation pipeline foundations.',
        'Planned',
        '2026-08-11',
        '2026-08-20'
    );

-- 8. Insert Tasks (Traceable to User Stories, Sprints & Assignees)
INSERT INTO
    tasks (
        sprint_id,
        story_id,
        assigned_to,
        title,
        description,
        priority,
        status,
        due_date
    )
VALUES (
        1,
        1,
        3,
        'Implement User Authentication',
        'Implement secure login and role-based access for platform users.',
        'High',
        'Completed',
        '2026-08-17'
    ),
    (
        1,
        2,
        3,
        'Implement AI Requirement Analysis',
        'Implement the requirement analysis workflow and integration with the AI service.',
        'High',
        'Completed',
        '2026-08-18'
    ),
    (
        2,
        3,
        3,
        'Implement AI Code Assistance',
        'Implement developer interaction with the AI engine for code suggestions.',
        'High',
        'In Progress',
        '2026-08-23'
    ),
    (
        2,
        3,
        3,
        'Implement Task Management',
        'Implement task assignment, task status updates, and development workflow.',
        'Medium',
        'In Progress',
        '2026-08-24'
    ),
    (
        2,
        3,
        3,
        'Integrate Testing Workflow',
        'Integrate test case execution and issue reporting into the development workflow.',
        'Medium',
        'Pending',
        '2026-08-25'
    ),
    (
        3,
        4,
        5,
        'Implement Automated Deployment Pipeline',
        'Configure the CI/CD workflow and Docker/Kubernetes deployment scripts.',
        'High',
        'Pending',
        '2026-08-20'
    );

-- 9. Insert Releases
INSERT INTO
    releases (
        project_id,
        version_number,
        release_date,
        release_notes,
        status,
        created_by
    )
VALUES (
        1,
        'v1.0',
        '2026-08-20',
        'Initial release containing user authentication and core project management features.',
        'Released',
        1
    ),
    (
        1,
        'v1.1',
        '2026-08-27',
        'Added AI-assisted requirement analysis, user story generation, and architecture suggestions.',
        'Planned',
        1
    ),
    (
        2,
        'v1.0',
        '2026-08-25',
        'Initial release of the automated deployment features.',
        'Planned',
        1
    );

-- 10. Insert Deployments (Executed by DevOps Engineer - user_id = 5)
INSERT INTO
    deployments (
        project_id,
        release_id,
        deployed_by,
        environment,
        deployment_date,
        status
    )
VALUES (
        1,
        1,
        5,
        'Development',
        '2026-08-20 10:00:00',
        'Successful'
    ),
    (
        1,
        1,
        5,
        'Testing',
        '2026-08-24 15:30:00',
        'Successful'
    ),
    (
        1,
        2,
        5,
        'Production',
        '2026-08-27 12:00:00',
        'Pending'
    ),
    (
        2,
        3,
        5,
        'Development',
        '2026-08-21 11:00:00',
        'Successful'
    );

-- 11. Insert AI Suggestions (With Context & Telemetry)
INSERT INTO
    ai_suggestions (
        requirement_id,
        task_id,
        suggestion_type,
        content,
        prompt_context,
        model_name,
        reviewed_by,
        generated_time,
        status
    )
VALUES (
        1,
        NULL,
        'Requirement Improvement',
        'The authentication requirement should specify secure password handling, role-based access control, invalid login handling, and session management.',
        'Requirement: User Authentication - Secure login and RBAC',
        'gemini-1.5-pro',
        2,
        '2026-08-11 10:00:00',
        'Accepted'
    ),
    (
        2,
        NULL,
        'Architecture',
        'Use an NLP-based requirement analysis service connected to the requirement management module to generate user stories and architecture recommendations.',
        'Requirement: AI Requirement Analysis - NLP pipeline architecture',
        'gemini-1.5-pro',
        2,
        '2026-08-11 10:15:00',
        'Accepted'
    ),
    (
        NULL,
        3,
        'Code',
        'Implement a service layer that sends the developer task context to the AI service and returns a generated code suggestion for review.',
        'Task: Implement AI Code Assistance - Service layer integration pattern',
        'gemini-1.5-pro',
        3,
        '2026-08-11 10:30:00',
        'Generated'
    ),
    (
        NULL,
        4,
        'Code',
        'Use task status transitions such as Pending, In Progress, and Completed and validate that only authorized users can update task status.',
        'Task: Implement Task Management - State machine transition validation',
        'gemini-1.5-pro',
        3,
        '2026-08-11 10:45:00',
        'Generated'
    ),
    (
        NULL,
        5,
        'Test Case',
        'Generate test cases covering successful execution, failed execution, issue reporting, bug fixing, and re-testing of the implemented feature.',
        'Task: Integrate Testing Workflow - Test suite coverage strategy',
        'gemini-1.5-pro',
        4,
        '2026-08-11 11:00:00',
        'Generated'
    );

-- 12. Insert Test Cases
INSERT INTO
    test_cases (
        task_id,
        title,
        test_type,
        steps,
        expected_result,
        status,
        executed_by,
        execution_date
    )
VALUES (
        1,
        'Verify Valid User Login',
        'Functional',
        'Enter valid username and password and click Login.',
        'User is authenticated and granted access according to their role.',
        'Passed',
        4,
        '2026-08-17 14:00:00'
    ),
    (
        1,
        'Verify Invalid User Login',
        'Security',
        'Enter an incorrect password and click Login.',
        'System rejects the login attempt and displays an appropriate error message.',
        'Passed',
        4,
        '2026-08-17 14:15:00'
    ),
    (
        2,
        'Verify Requirement Analysis',
        'Functional',
        'Submit a valid business requirement for AI analysis.',
        'AI analyzes the requirement and produces relevant output.',
        'Passed',
        4,
        '2026-08-18 16:00:00'
    ),
    (
        3,
        'Verify AI Code Suggestion',
        'Integration',
        'Developer requests an AI code suggestion for an assigned task.',
        'AI generates a relevant code suggestion that the developer can review.',
        'Pending',
        NULL,
        NULL
    ),
    (
        4,
        'Verify Task Status Update',
        'Functional',
        'Developer changes the task status from In Progress to Completed.',
        'The updated task status is stored successfully.',
        'Pending',
        NULL,
        NULL
    ),
    (
        5,
        'Verify Testing Workflow',
        'End-to-End',
        'Execute generated test cases and report an issue when a test fails.',
        'The issue is recorded and can be assigned for resolution.',
        'Pending',
        NULL,
        NULL
    ),
    (
        6,
        'Verify Automated Deployment',
        'Automated',
        'Trigger the CI/CD deployment after successful testing.',
        'Application is built and deployed successfully.',
        'Pending',
        NULL,
        NULL
    );

-- 13. Insert Issues (Audited with Reporter & Assignee)
INSERT INTO
    issues (
        task_id,
        reported_by,
        assigned_to,
        title,
        description,
        severity,
        priority,
        status
    )
VALUES (
        1,
        4,
        3,
        'Invalid Login Error Handling',
        'Incorrect credentials are not displaying the expected error message to the user.',
        'Medium',
        'Medium',
        'Resolved'
    ),
    (
        3,
        4,
        3,
        'AI Code Suggestion Validation',
        'Generated code suggestion requires additional validation before it can be accepted by the developer.',
        'High',
        'High',
        'Open'
    ),
    (
        4,
        4,
        3,
        'Task Status Update Issue',
        'Task status is not correctly persisted after the developer updates the task.',
        'Medium',
        'High',
        'In Progress'
    ),
    (
        5,
        4,
        3,
        'Failed Test Not Reported',
        'A failed test case is not automatically creating an issue for developer resolution.',
        'High',
        'High',
        'Open'
    );

-- ============================================================
-- VERIFICATION & AUDIT QUERIES
-- ============================================================

-- 1. Table Record Count Audit
SELECT 'users' AS table_name, COUNT(*) AS record_count
FROM users
UNION ALL
SELECT 'projects', COUNT(*)
FROM projects
UNION ALL
SELECT 'teams', COUNT(*)
FROM teams
UNION ALL
SELECT 'team_members', COUNT(*)
FROM team_members
UNION ALL
SELECT 'requirements', COUNT(*)
FROM requirements
UNION ALL
SELECT 'user_stories', COUNT(*)
FROM user_stories
UNION ALL
SELECT 'sprints', COUNT(*)
FROM sprints
UNION ALL
SELECT 'tasks', COUNT(*)
FROM tasks
UNION ALL
SELECT 'releases', COUNT(*)
FROM releases
UNION ALL
SELECT 'deployments', COUNT(*)
FROM deployments
UNION ALL
SELECT 'ai_suggestions', COUNT(*)
FROM ai_suggestions
UNION ALL
SELECT 'test_cases', COUNT(*)
FROM test_cases
UNION ALL
SELECT 'issues', COUNT(*)
FROM issues;

-- 2. End-to-End Traceability Query: Project -> Requirement -> User Story -> Task -> Assignee
SELECT
    p.name AS project,
    r.title AS requirement,
    us.story_title AS user_story,
    us.story_points,
    t.title AS task,
    u.name AS assigned_user,
    u.role AS user_role,
    s.sprint_name,
    t.status AS task_status
FROM
    projects p
    JOIN requirements r ON p.project_id = r.project_id
    JOIN user_stories us ON r.requirement_id = us.requirement_id
    JOIN tasks t ON us.story_id = t.story_id
    JOIN users u ON t.assigned_to = u.user_id
    JOIN sprints s ON t.sprint_id = s.sprint_id;

-- 3. Release and Deployment Traceability: Project -> Release -> Environment -> Operator
SELECT
    p.name AS project,
    r.version_number,
    r.status AS release_status,
    d.environment,
    d.deployment_date,
    d.status AS deployment_status,
    u.name AS deployed_by,
    u.role AS operator_role
FROM
    projects p
    JOIN releases r ON p.project_id = r.project_id
    JOIN deployments d ON r.release_id = d.release_id
    LEFT JOIN users u ON d.deployed_by = u.user_id;

-- 4. Sprint Metrics & Derived Duration
SELECT
    sprint_id,
    sprint_name,
    status,
    start_date,
    end_date,
    DATEDIFF(end_date, start_date) AS duration_days
FROM sprints;

-- 5. AI Telemetry & Approval Audit
SELECT
    a.suggestion_id,
    a.suggestion_type,
    a.model_name,
    COALESCE(r.title, t.title) AS associated_artifact,
    u.name AS reviewed_by,
    u.role AS reviewer_role,
    a.status,
    a.generated_time
FROM
    ai_suggestions a
    LEFT JOIN requirements r ON a.requirement_id = r.requirement_id
    LEFT JOIN tasks t ON a.task_id = t.task_id
    LEFT JOIN users u ON a.reviewed_by = u.user_id;
    
    
    SHOW TABLES;
    select*from users;