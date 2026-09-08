package com.neuroforge.entity;

public enum Role {
    ROLE_ADMIN("Admin"),
    ROLE_PROJECT_MANAGER("Project Manager"),
    ROLE_BUSINESS_ANALYST("Business Analyst"),
    ROLE_DEVELOPER("Developer"),
    ROLE_TESTER("Tester"),
    ROLE_DEVOPS_ENGINEER("DevOps Engineer");

    private final String displayName;

    Role(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Converts a database role string (e.g. "Project Manager" or "ROLE_PROJECT_MANAGER") to Role enum.
     */
    public static Role fromString(String roleStr) {
        if (roleStr == null || roleStr.trim().isEmpty()) {
            return ROLE_DEVELOPER;
        }
        String clean = roleStr.trim().replace(" ", "_").toUpperCase();
        if (!clean.startsWith("ROLE_")) {
            clean = "ROLE_" + clean;
        }

        // Direct enum or display name match
        for (Role role : Role.values()) {
            if (role.name().equalsIgnoreCase(clean) 
                || role.displayName.equalsIgnoreCase(roleStr.trim())) {
                return role;
            }
        }

        // Robust alias matching
        if (clean.contains("ADMIN")) return ROLE_ADMIN;
        if (clean.contains("MANAGER") || clean.contains("LEAD")) return ROLE_PROJECT_MANAGER;
        if (clean.contains("ANALYST")) return ROLE_BUSINESS_ANALYST;
        if (clean.contains("TEST") || clean.contains("QA")) return ROLE_TESTER;
        if (clean.contains("DEVOPS")) return ROLE_DEVOPS_ENGINEER;
        if (clean.contains("DEV")) return ROLE_DEVELOPER;

        return ROLE_DEVELOPER;
    }
}
