package com.pulseboard.backend.board;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BoardColumnRepository extends JpaRepository<BoardColumn, UUID> {
  List<BoardColumn> findAllByBoardIdOrderByPositionAsc(UUID boardId);
  Optional<BoardColumn> findByIdAndBoardId(UUID id, UUID boardId);
  Optional<BoardColumn> findByIdAndBoard_TenantId(UUID id, UUID tenantId);
}
