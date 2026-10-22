package com.pulseboard.backend.card;

import com.pulseboard.backend.auth.AuthPrincipal;
import com.pulseboard.backend.board.BoardColumn;
import com.pulseboard.backend.board.BoardColumnRepository;
import com.pulseboard.backend.card.dto.CardDtos;
import com.pulseboard.backend.common.ApiException;
import com.pulseboard.backend.user.User;
import com.pulseboard.backend.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class CardService {

  private final CardRepository cardRepository;
  private final BoardColumnRepository columnRepository;
  private final UserRepository userRepository;

  public CardService(CardRepository cardRepository, BoardColumnRepository columnRepository, UserRepository userRepository) {
    this.cardRepository = cardRepository;
    this.userRepository = userRepository;
    this.columnRepository = columnRepository;
  }

  @Transactional
  public CardDtos.CardResponse createCard(AuthPrincipal principal, CardDtos.CardRequest request) {
    if (request.title() == null || request.title().isBlank()) {
      throw ApiException.badRequest("title_required", "Title is required");
    }
    BoardColumn column = columnRepository.findByIdAndBoard_TenantId(request.columnId(), principal.tenantId())
        .orElseThrow(() -> ApiException.notFound("Column not found"));
    User assignee = null;
    if (request.assigneeId() != null) {
      assignee = userRepository.findById(request.assigneeId())
          .filter(u -> u.getTenant().getId().equals(principal.tenantId()))
          .orElseThrow(() -> ApiException.badRequest("invalid_assignee", "Assignee must belong to same tenant"));
    }
    int position = request.position() == null ? 0 : request.position();
    Card card = new Card(column, column.getBoard().getTenant(), request.title(), request.description(), request.priority() == null ? "MEDIUM" : request.priority(), assignee, request.labels(), request.dueAt(), position);
    card = cardRepository.save(card);
    return toResponse(card);
  }

  @Transactional
  public CardDtos.CardResponse updateCard(AuthPrincipal principal, UUID cardId, CardDtos.CardUpdateRequest request) {
    Card card = cardRepository.findByIdAndTenantId(cardId, principal.tenantId())
        .orElseThrow(() -> ApiException.notFound("Card not found"));
    if (request.title() != null) card.setTitle(request.title());
    if (request.description() != null) card.setDescription(request.description());
    if (request.priority() != null) card.setPriority(request.priority());
    if (request.labels() != null) card.setLabels(request.labels());
    card.setDueAt(request.dueAt());
    if (request.assigneeId() != null) {
      User assignee = userRepository.findById(request.assigneeId())
          .filter(u -> u.getTenant().getId().equals(principal.tenantId()))
          .orElseThrow(() -> ApiException.badRequest("invalid_assignee", "Assignee must belong to same tenant"));
      card.setAssignee(assignee);
    }
    card.touch();
    return toResponse(card);
  }

  @Transactional
  public CardDtos.CardResponse moveCard(AuthPrincipal principal, UUID cardId, CardDtos.MoveCardRequest request) {
    if (request.columnId() == null || request.position() == null) {
      throw ApiException.badRequest("invalid_move", "columnId and position required");
    }
    Card card = cardRepository.findByIdAndTenantId(cardId, principal.tenantId())
        .orElseThrow(() -> ApiException.notFound("Card not found"));
    BoardColumn column = columnRepository.findByIdAndBoard_TenantId(request.columnId(), principal.tenantId())
        .orElseThrow(() -> ApiException.notFound("Column not found"));
    card.setColumn(column);
    card.setPosition(request.position());
    card.touch();
    return toResponse(card);
  }

  @Transactional
  public void deleteCard(AuthPrincipal principal, UUID cardId) {
    Card card = cardRepository.findByIdAndTenantId(cardId, principal.tenantId())
        .orElseThrow(() -> ApiException.notFound("Card not found"));
    cardRepository.delete(card);
  }

  @Transactional(readOnly = true)
  public CardDtos.CardResponse getCard(AuthPrincipal principal, UUID cardId) {
    Card card = cardRepository.findByIdAndTenantId(cardId, principal.tenantId())
        .orElseThrow(() -> ApiException.notFound("Card not found"));
    return toResponse(card);
  }

  private CardDtos.CardResponse toResponse(Card card) {
    return new CardDtos.CardResponse(
        card.getId(),
        card.getColumn().getId(),
        card.getTenant().getId(),
        card.getTitle(),
        card.getDescription(),
        card.getPriority(),
        card.getAssignee() == null ? null : card.getAssignee().getId(),
        card.getAssignee() == null ? null : card.getAssignee().getDisplayName(),
        card.getLabels(),
        card.getDueAt(),
        card.getPosition());
  }
}
