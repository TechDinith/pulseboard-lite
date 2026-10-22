package com.pulseboard.backend.board.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class BoardDtos {
  public record BoardRequest(String name) {}
  public record BoardResponse(UUID id, String name, OffsetDateTime createdAt) {}
  public record ColumnRequest(String name) {}
  public record ColumnResponse(UUID id, String name, Integer position) {}
  public record BoardDetailResponse(UUID id, String name, List<ColumnWithCards> columns) {}
  public record ColumnWithCards(UUID id, String name, Integer position, List<CardSummary> cards) {}
  public record CardSummary(
      UUID id,
      String title,
      String description,
      String priority,
      UUID assigneeId,
      String assigneeName,
      String labels,
      OffsetDateTime dueAt,
      Integer position) {}
}
