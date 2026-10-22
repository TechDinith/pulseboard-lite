package com.pulseboard.backend.board;

import com.pulseboard.backend.auth.AuthPrincipal;
import com.pulseboard.backend.board.dto.BoardDtos;
import com.pulseboard.backend.card.Card;
import com.pulseboard.backend.card.CardRepository;
import com.pulseboard.backend.common.ApiException;
import com.pulseboard.backend.tenant.Tenant;
import com.pulseboard.backend.tenant.TenantRepository;
import com.pulseboard.backend.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class BoardService {

  private final BoardRepository boardRepository;
  private final BoardColumnRepository columnRepository;
  private final CardRepository cardRepository;
  private final TenantRepository tenantRepository;
  private final UserRepository userRepository;

  public BoardService(BoardRepository boardRepository, BoardColumnRepository columnRepository, CardRepository cardRepository, TenantRepository tenantRepository, UserRepository userRepository) {
    this.boardRepository = boardRepository;
    this.columnRepository = columnRepository;
    this.cardRepository = cardRepository;
    this.tenantRepository = tenantRepository;
    this.userRepository = userRepository;
  }

  @Transactional(readOnly = true)
  public List<BoardDtos.BoardResponse> listBoards(AuthPrincipal principal) {
    return boardRepository.findAllByTenantId(principal.tenantId()).stream()
        .map(b -> new BoardDtos.BoardResponse(b.getId(), b.getName(), b.getCreatedAt()))
        .toList();
  }

  @Transactional
  public BoardDtos.BoardResponse createBoard(AuthPrincipal principal, BoardDtos.BoardRequest request) {
    Tenant tenant = tenantRepository.findById(principal.tenantId())
        .orElseThrow(() -> ApiException.unauthorized("Unknown tenant"));
    Board board = boardRepository.save(new Board(tenant, request.name()));
    // create default columns
    columnRepository.save(new BoardColumn(board, "Backlog", 0));
    columnRepository.save(new BoardColumn(board, "In Progress", 1));
    columnRepository.save(new BoardColumn(board, "Review", 2));
    columnRepository.save(new BoardColumn(board, "Done", 3));
    return new BoardDtos.BoardResponse(board.getId(), board.getName(), board.getCreatedAt());
  }

  @Transactional(readOnly = true)
  public BoardDtos.BoardDetailResponse getBoardDetail(AuthPrincipal principal, UUID boardId) {
    Board board = boardRepository.findByIdAndTenantId(boardId, principal.tenantId())
        .orElseThrow(() -> ApiException.notFound("Board not found"));
    List<BoardColumn> columns = columnRepository.findAllByBoardIdOrderByPositionAsc(board.getId());
    List<BoardDtos.ColumnWithCards> result = new ArrayList<>();
    for (BoardColumn col : columns) {
      List<Card> cards = cardRepository.findAllByColumnIdOrderByPositionAsc(col.getId());
      List<BoardDtos.CardSummary> cardSummaries = cards.stream()
          .map(c -> new BoardDtos.CardSummary(
              c.getId(),
              c.getTitle(),
              c.getDescription(),
              c.getPriority(),
              c.getAssignee() == null ? null : c.getAssignee().getId(),
              c.getAssignee() == null ? null : c.getAssignee().getDisplayName(),
              c.getLabels(),
              c.getDueAt(),
              c.getPosition()))
          .toList();
      result.add(new BoardDtos.ColumnWithCards(col.getId(), col.getName(), col.getPosition(), cardSummaries));
    }
    return new BoardDtos.BoardDetailResponse(board.getId(), board.getName(), result);
  }

  @Transactional
  public BoardDtos.ColumnResponse createColumn(AuthPrincipal principal, UUID boardId, BoardDtos.ColumnRequest request) {
    Board board = boardRepository.findByIdAndTenantId(boardId, principal.tenantId())
        .orElseThrow(() -> ApiException.notFound("Board not found"));
    List<BoardColumn> columns = columnRepository.findAllByBoardIdOrderByPositionAsc(boardId);
    int position = columns.isEmpty() ? 0 : columns.get(columns.size() - 1).getPosition() + 1;
    BoardColumn column = columnRepository.save(new BoardColumn(board, request.name(), position));
    return new BoardDtos.ColumnResponse(column.getId(), column.getName(), column.getPosition());
  }
}
