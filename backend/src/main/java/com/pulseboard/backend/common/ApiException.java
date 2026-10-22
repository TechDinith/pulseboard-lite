package com.pulseboard.backend.common;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {

  private final HttpStatus status;
  private final String code;

  public ApiException(HttpStatus status, String code, String message) {
    super(message);
    this.status = status;
    this.code = code;
  }

  public HttpStatus getStatus() {
    return status;
  }

  public String getCode() {
    return code;
  }

  public static ApiException conflict(String code, String message) {
    return new ApiException(HttpStatus.CONFLICT, code, message);
  }

  public static ApiException unauthorized(String message) {
    return new ApiException(HttpStatus.UNAUTHORIZED, "invalid_credentials", message);
  }

  public static ApiException badRequest(String code, String message) {
    return new ApiException(HttpStatus.BAD_REQUEST, code, message);
  }

  public static ApiException notFound(String codeOrMessage) {
    if ("Board not found".equals(codeOrMessage) || "Column not found".equals(codeOrMessage)
        || "Card not found".equals(codeOrMessage) || "Not found".equals(codeOrMessage)) {
      return new ApiException(HttpStatus.NOT_FOUND, "not_found", codeOrMessage);
    }
    if (codeOrMessage != null && codeOrMessage.contains("_")) {
      return new ApiException(HttpStatus.NOT_FOUND, codeOrMessage, codeOrMessage.replace('_', ' '));
    }
    return new ApiException(HttpStatus.NOT_FOUND, "not_found", codeOrMessage == null ? "Not found" : codeOrMessage);
  }

  public static ApiException forbidden(String code, String message) {
    return new ApiException(HttpStatus.FORBIDDEN, code, message);
  }
}
