package com.pulseboard.backend.auth;

import java.time.Instant;
import java.util.UUID;

public record JwtClaims(
    UUID userId,
    String email,
    java.util.UUID tenantId,
    String role,
    Instant expiresAt) {
}
