package com.pulseboard.backend.auth;

import java.util.UUID;

public record AuthPrincipal(UUID userId, UUID tenantId, String email, String role) {
}
