package com.pulseboard.backend.board;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "columns")
public class BoardColumn {

  @Id
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "board_id", nullable = false)
  private Board board;

  @Column(nullable = false, length = 80)
  private String name;

  @Column(nullable = false)
  private Integer position;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  protected BoardColumn() {
  }

  public BoardColumn(Board board, String name, Integer position) {
    this.id = UUID.randomUUID();
    this.board = board;
    this.name = name.trim();
    this.position = position;
    this.createdAt = OffsetDateTime.now();
  }

  public UUID getId() {
    return id;
  }

  public Board getBoard() {
    return board;
  }

  public String getName() {
    return name;
  }

  public Integer getPosition() {
    return position;
  }

  public void setPosition(Integer position) {
    this.position = position;
  }

  public void setName(String name) {
    this.name = name.trim();
  }
}
