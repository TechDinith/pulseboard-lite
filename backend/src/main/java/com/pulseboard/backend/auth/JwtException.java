package com.pulseboard.backend.auth;

public class JwtException extends RuntimeException {

  public JwtException(String message) {
    super(message);
  }
}
