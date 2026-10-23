package com.pulseboard.backend.ws;

import com.pulseboard.backend.auth.JwtClaims;
import com.pulseboard.backend.auth.JwtException;
import com.pulseboard.backend.auth.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

  public static final String ATTR_TENANT_ID = "tenantId";
  public static final String ATTR_USER_ID = "userId";

  private final JwtService jwtService;

  public JwtHandshakeInterceptor(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @Override
  public boolean beforeHandshake(
      ServerHttpRequest request,
      ServerHttpResponse response,
      WebSocketHandler wsHandler,
      Map<String, Object> attributes) {

    if (!(request instanceof ServletServerHttpRequest servletRequest)) {
      return false;
    }

    String token = servletRequest.getServletRequest().getParameter("token");
    if (token == null || token.isBlank()) {
      response.setStatusCode(HttpStatus.UNAUTHORIZED);
      return false;
    }

    try {
      JwtClaims claims = jwtService.verify(token);
      attributes.put(ATTR_TENANT_ID, claims.tenantId());
      attributes.put(ATTR_USER_ID, claims.userId());
      return true;
    } catch (JwtException ex) {
      response.setStatusCode(HttpStatus.UNAUTHORIZED);
      return false;
    }
  }

  @Override
  public void afterHandshake(
      ServerHttpRequest request,
      ServerHttpResponse response,
      WebSocketHandler wsHandler,
      Exception exception) {
  }
}
