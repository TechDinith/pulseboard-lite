package com.pulseboard.backend.card;

import com.pulseboard.backend.board.BoardColumn;
import com.pulseboard.backend.tenant.Tenant;
import com.pulseboard.backend.user.User;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "cards")
public class Card {

  @Id
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "column_id", nullable = false)
  private BoardColumn column;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "tenant_id", nullable = false)
  private Tenant tenant;

  @Column(nullable = false, length = 200)
  private String title;

  @Column(columnDefinition = "text")
  private String description;

  @Column(nullable = false, length = 10)
  private String priority;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "assignee_id")
  private User assignee;

  @Column(columnDefinition = "text")
  private String labels;

  @Column(name = "due_at")
  private OffsetDateTime dueAt;

  @Column(nullable = false)
  private Integer position;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  protected Card() {
  }

  public Card(BoardColumn column, Tenant tenant, String title, String description, String priority, User assignee, String labels, OffsetDateTime dueAt, Integer position) {
    this.id = UUID.randomUUID();
    this.column = column;
    this.tenant = tenant;
    this.title = title.trim();
    this.description = description;
    this.priority = priority;
    this.assignee = assignee;
    this.labels = labels;
    this.dueAt = dueAt;
    this.position = position;
    this.createdAt = OffsetDateTime.now();
    this.updatedAt = OffsetDateTime.now();
  }

  public UUID getId() {
    return id;
  }

  public BoardColumn getColumn() {
    return column;
  }

  public Tenant getTenant() {
    return tenant;
  }

  public String getTitle() {
    return title;
  }

  public String getDescription() {
    return description;
  }

  public String getPriority() {
    return priority;
  }

  public User getAssignee() {
    return assignee;
  }

  public String getLabels() {
    return labels;
  }

  public OffsetDateTime getDueAt() {
    return dueAt;
  }

  public Integer getPosition() {
    return position;
  }

  public void setColumn(BoardColumn column) {
    this.column = column;
  }

  public void setTitle(String title) {
    this.title = title.trim();
    this.updatedAt = OffsetDateTime.now();
  }

  public void setDescription(String description) {
    this.description = description;
    this.updatedAt = OffsetDateTime.now();
  }

  public void setPriority(String priority) {
    this.priority = priority;
    this.updatedAt = OffsetDateTime.now();
  }

  public void setAssignee(User assignee) {
    this.assignee = assignee;
    this.updatedAt = OffsetDateTime.now();
  }

  public void setLabels(String labels) {
    this.labels = labels;
    this.updatedAt = OffsetDateTime.now();
  }

  public void setDueAt(OffsetDateTime dueAt) {
    this.dueAt = dueAt;
    this.updatedAt = OffsetDateTime.now();
  }

  public void setPosition(Integer position) {
    this.position = position;
    this.updatedAt = OffsetDateTime.now();
  }

  public void touch() {
    this.updatedAt = OffsetDateTime.now();
  }
}
