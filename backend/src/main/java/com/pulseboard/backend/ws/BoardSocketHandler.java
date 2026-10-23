package com.pulseboard.backend.ws;

import com.pulseboard.backend.board.BoardRepository;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class BoardSocketHandler extends TextWebSocketHandler implements MessageListener {

  public record ClientMessage(String type, String boardId) {
  }

  public record ServerMessage(String type, String boardId, Object payload) {
  }

  public record RedisBoardEvent(String type, String boardId, Object payload) {
  }

  private final ObjectMapper objectMapper;
  private final BoardRepository boardRepository;
  private final Map<String, Set<WebSocketSession>> boardSessions = new ConcurrentHashMap<>();
  private final Map<String, String> sessionBoard = new ConcurrentHashMap<>();

  public BoardSocketHandler(ObjectMapper objectMapper, BoardRepository boardRepository) {
    this.objectMapper = objectMapper;
    this.boardRepository = boardRepository;
  }

  @Override
  protected void handleTextMessage(WebSocketSession session, TextMessage message) {
    ClientMessage client;
    try {
      client = objectMapper.readValue(message.getPayload(), ClientMessage.class);
    } catch (Exception ex) {
      send(session, new ServerMessage("error", null, Map.of("message", "invalid message")));
      return;
    }

    if ("subscribe".equals(client.type()) && client.boardId() != null) {
      UUID tenantId = (UUID) session.getAttributes().get(JwtHandshakeInterceptor.ATTR_TENANT_ID);
      boolean allowed = boardRepository.findByIdAndTenantId(UUID.fromString(client.boardId()), tenantId).isPresent();
      if (!allowed) {
        send(session, new ServerMessage("error", client.boardId(), Map.of("message", "board not found")));
        return;
      }

      detach(session);
      boardSessions
          .computeIfAbsent(client.boardId(), key -> Collections.newSetFromMap(new ConcurrentHashMap<>()))
          .add(session);
      sessionBoard.put(session.getId(), client.boardId());
      send(session, new ServerMessage("subscribed", client.boardId(), Map.of("ok", true)));
      return;
    }

    if ("unsubscribe".equals(client.type())) {
      detach(session);
      send(session, new ServerMessage("unsubscribed", client.boardId(), Map.of("ok", true)));
      return;
    }

    send(session, new ServerMessage("error", client.boardId(), Map.of("message", "unknown type")));
  }

  @Override
  public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
    detach(session);
  }

  @Override
  public void onMessage(Message message, byte[] pattern) {
    String json = new String(message.getBody(), StandardCharsets.UTF_8);
    RedisBoardEvent event;
    try {
      event = objectMapper.readValue(json, RedisBoardEvent.class);
    } catch (Exception ex) {
      return;
    }

    Set<WebSocketSession> sessions = boardSessions.get(event.boardId());
    if (sessions == null || sessions.isEmpty()) {
      return;
    }

    ServerMessage outbound = new ServerMessage("board:update", event.boardId(), event);
    for (WebSocketSession session : sessions) {
      send(session, outbound);
    }
  }

  private void detach(WebSocketSession session) {
    String boardId = sessionBoard.remove(session.getId());
    if (boardId == null) {
      return;
    }
    Set<WebSocketSession> sessions = boardSessions.get(boardId);
    if (sessions != null) {
      sessions.remove(session);
      if (sessions.isEmpty()) {
        boardSessions.remove(boardId);
      }
    }
  }

  private void send(WebSocketSession session, ServerMessage message) {
    if (!session.isOpen()) {
      return;
    }
    try {
      String payload = objectMapper.writeValueAsString(message);
      synchronized (session) {
        session.sendMessage(new TextMessage(payload));
      }
    } catch (Exception ignored) {
    }
  }
}
