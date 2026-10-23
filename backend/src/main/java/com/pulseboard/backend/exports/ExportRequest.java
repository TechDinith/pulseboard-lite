package com.pulseboard.backend.exports;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "exports")
public class ExportRequest {

  @Id
  private UUID id;

  @Column(name = "tenant_id", nullable = false)
  private UUID tenantId;

  @Column(name = "board_id", nullable = false)
  private UUID boardId;

  @Column(name = "requested_by", nullable = false)
  private UUID requestedBy;

  @Column(nullable = false)
  private String status;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  protected ExportRequest() {
  }

  public ExportRequest(UUID tenantId, UUID boardId, UUID requestedBy) {
    this.id = UUID.randomUUID();
    this.tenantId = tenantId;
    this.boardId = boardId;
    this.requestedBy = requestedBy;
    this.status = "QUEUED";
    this.createdAt = OffsetDateTime.now();
    this.updatedAt = OffsetDateTime.now();
  }

  public UUID getId() {
    return id;
  }

  public UUID getTenantId() {
    return tenantId;
  }

  public UUID getBoardId() {
    return boardId;
  }

  public UUID getRequestedBy() {
    return requestedBy;
  }

  public String getStatus() {
    return status;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public OffsetDateTime getUpdatedAt() {
    return updatedAt;
  }
}
