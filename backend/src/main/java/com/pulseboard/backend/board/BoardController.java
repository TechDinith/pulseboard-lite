package com.pulseboard.backend.board;

import com.pulseboard.backend.auth.AuthPrincipal;
import com.pulseboard.backend.board.dto.BoardDtos;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/boards")
public class BoardController {

  private final BoardService boardService;

  public BoardController(BoardService boardService) {
    this.boardService = boardService;
  }

  @GetMapping
  public List<BoardDtos.BoardResponse> list(@AuthenticationPrincipal AuthPrincipal principal) {
    return boardService.listBoards(principal);
  }

  @PostMapping
  public BoardDtos.BoardResponse create(@AuthenticationPrincipal AuthPrincipal principal, @RequestBody BoardDtos.BoardRequest request) {
    return boardService.createBoard(principal, request);
  }

  @GetMapping("/{id}")
  public BoardDtos.BoardDetailResponse get(@AuthenticationPrincipal AuthPrincipal principal, @PathVariable UUID id) {
    return boardService.getBoardDetail(principal, id);
  }

  @PostMapping("/{id}/columns")
  public BoardDtos.ColumnResponse addColumn(@AuthenticationPrincipal AuthPrincipal principal, @PathVariable UUID id, @RequestBody BoardDtos.ColumnRequest request) {
    return boardService.createColumn(principal, id, request);
  }
}
