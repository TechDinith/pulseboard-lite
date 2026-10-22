package com.pulseboard.backend.card.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class CardDtos {
  public record CardRequest(
      UUID columnId,
      String title,
      String description,
      String priority,
      UUID assigneeId,
      String labels,
      OffsetDateTime dueAt,
      Integer position) {}
  public record CardUpdateRequest(
      String title,
      String description,
      String priority,
      UUID assigneeId,
      String labels,
      OffsetDateTime dueAt) {}
  public record MoveCardRequest(
      UUID columnId,
      Integer position) {}
  public record CardResponse(
      UUID id,
      UUID columnId,
      UUID tenantId,
      String title,
      String description,
      String priority,
      UUID assigneeId,
      String assigneeName,
      String labels,
      OffsetDateTime dueAt,
      Integer position) {}
}
