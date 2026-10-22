package com.pulseboard.backend.card;

import com.pulseboard.backend.auth.AuthPrincipal;
import com.pulseboard.backend.card.dto.CardDtos;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cards")
public class CardController {

  private final CardService cardService;

  public CardController(CardService cardService) {
    this.cardService = cardService;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public CardDtos.CardResponse create(@AuthenticationPrincipal AuthPrincipal principal, @RequestBody CardDtos.CardRequest request) {
    return cardService.createCard(principal, request);
  }

  @GetMapping("/{id}")
  public CardDtos.CardResponse get(@AuthenticationPrincipal AuthPrincipal principal, @PathVariable UUID id) {
    return cardService.getCard(principal, id);
  }

  @PutMapping("/{id}")
  public CardDtos.CardResponse update(@AuthenticationPrincipal AuthPrincipal principal, @PathVariable UUID id, @RequestBody CardDtos.CardUpdateRequest request) {
    return cardService.updateCard(principal, id, request);
  }

  @PatchMapping("/{id}/move")
  public CardDtos.CardResponse move(@AuthenticationPrincipal AuthPrincipal principal, @PathVariable UUID id, @RequestBody CardDtos.MoveCardRequest request) {
    return cardService.moveCard(principal, id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@AuthenticationPrincipal AuthPrincipal principal, @PathVariable UUID id) {
    cardService.deleteCard(principal, id);
  }
}
