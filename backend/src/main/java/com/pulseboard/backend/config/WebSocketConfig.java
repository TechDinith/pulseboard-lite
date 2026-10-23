package com.pulseboard.backend.config;

import com.pulseboard.backend.ws.BoardSocketHandler;
import com.pulseboard.backend.ws.JwtHandshakeInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

  private final BoardSocketHandler boardSocketHandler;
  private final JwtHandshakeInterceptor jwtHandshakeInterceptor;

  public WebSocketConfig(BoardSocketHandler boardSocketHandler, JwtHandshakeInterceptor jwtHandshakeInterceptor) {
    this.boardSocketHandler = boardSocketHandler;
    this.jwtHandshakeInterceptor = jwtHandshakeInterceptor;
  }

  @Override
  public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
    registry.addHandler(boardSocketHandler, "/ws")
        .addInterceptors(jwtHandshakeInterceptor)
        .setAllowedOrigins("http://localhost:3000");
  }

  @Bean
  RedisMessageListenerContainer webSocketRedisListenerContainer(
      RedisConnectionFactory connectionFactory,
      BoardSocketHandler boardSocketHandler) {
    RedisMessageListenerContainer container = new RedisMessageListenerContainer();
    container.setConnectionFactory(connectionFactory);
    container.addMessageListener(boardSocketHandler, new PatternTopic("board:*"));
    return container;
  }
}
