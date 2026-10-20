package com.pulseboard.backend.auth.dto;

import java.util.UUID;

public record UserResponse(
    UUID id,
    String email,
    String displayName,
    String role,
    UUID tenantId,
    String tenantName) {
}
