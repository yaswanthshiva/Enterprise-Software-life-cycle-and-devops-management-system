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
        for (Role role : Role.values()) {
            if (role.name().equalsIgnoreCase(clean) || role.displayName.equalsIgnoreCase(roleStr.trim())) {
                return role;
            }
        }
        return ROLE_DEVELOPER;
    }
}
