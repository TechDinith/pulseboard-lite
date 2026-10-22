package com.pulseboard.backend.board;

import com.pulseboard.backend.tenant.Tenant;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "boards")
public class Board {

  @Id
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "tenant_id", nullable = false)
  private Tenant tenant;

  @Column(nullable = false, length = 120)
  private String name;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  protected Board() {
  }

  public Board(Tenant tenant, String name) {
    this.id = UUID.randomUUID();
    this.tenant = tenant;
    this.name = name.trim();
    this.createdAt = OffsetDateTime.now();
  }

  public UUID getId() {
    return id;
  }

  public Tenant getTenant() {
    return tenant;
  }

  public String getName() {
    return name;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }
}
