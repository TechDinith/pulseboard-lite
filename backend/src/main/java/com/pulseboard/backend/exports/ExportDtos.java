package com.pulseboard.backend.exports;

import java.time.OffsetDateTime;
import java.util.UUID;

public class ExportDtos {
  public record ExportRequestBody(UUID boardId) {}
  public record ExportResponse(UUID id, UUID boardId, String status, OffsetDateTime createdAt) {}
}
