package com.pulseboard.backend.events;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;
import java.util.UUID;

@Component
public class BoardEventPublisher {

  private final StringRedisTemplate redisTemplate;
  private final ObjectMapper objectMapper;

  public BoardEventPublisher(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
    this.redisTemplate = redisTemplate;
    this.objectMapper = objectMapper;
  }

  public void publishBoardUpdate(UUID boardId, String type, Object payload) {
    String message = objectMapper.writeValueAsString(Map.of(
        "type", type,
        "boardId", boardId.toString(),
        "payload", payload
    ));
    redisTemplate.convertAndSend("board:" + boardId, message);
  }
}
