package com.pulseboard.backend.board;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BoardRepository extends JpaRepository<Board, UUID> {
  List<Board> findAllByTenantId(UUID tenantId);
  Optional<Board> findByIdAndTenantId(UUID id, UUID tenantId);
}
