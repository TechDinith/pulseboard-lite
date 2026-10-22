package com.pulseboard.backend.card;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CardRepository extends JpaRepository<Card, UUID> {
  List<Card> findAllByColumnIdOrderByPositionAsc(UUID columnId);
  List<Card> findAllByTenantId(UUID tenantId);
  Optional<Card> findByIdAndTenantId(UUID id, UUID tenantId);
}
