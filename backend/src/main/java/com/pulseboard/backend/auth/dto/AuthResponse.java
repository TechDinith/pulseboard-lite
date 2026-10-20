package com.pulseboard.backend.auth.dto;

public record AuthResponse(String token, UserResponse user) {
}
