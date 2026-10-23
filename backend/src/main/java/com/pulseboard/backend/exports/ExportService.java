package com.pulseboard.backend.exports;

import com.pulseboard.backend.auth.AuthPrincipal;
import com.pulseboard.backend.board.BoardRepository;
import com.pulseboard.backend.common.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ExportService {

  private final ExportRepository exportRepository;
  private final BoardRepository boardRepository;
  private final SqsClient sqsClient;
  private final ObjectMapper objectMapper;

  public ExportService(ExportRepository exportRepository, BoardRepository boardRepository, SqsClient sqsClient, ObjectMapper objectMapper) {
    this.exportRepository = exportRepository;
    this.boardRepository = boardRepository;
    this.sqsClient = sqsClient;
    this.objectMapper = objectMapper;
  }

  @Transactional
  public ExportDtos.ExportResponse requestExport(AuthPrincipal principal, ExportDtos.ExportRequestBody body) {
    if (body.boardId() == null) {
      throw ApiException.badRequest("board_required", "boardId required");
    }
    boardRepository.findByIdAndTenantId(body.boardId(), principal.tenantId())
        .orElseThrow(() -> ApiException.notFound("Board not found"));
    ExportRequest export = exportRepository.save(new ExportRequest(principal.tenantId(), body.boardId(), principal.userId()));
    try {
      String payload = objectMapper.writeValueAsString(Map.of(
          "exportId", export.getId().toString(),
          "boardId", export.getBoardId().toString(),
          "tenantId", export.getTenantId().toString(),
          "requestedBy", export.getRequestedBy().toString()
      ));
      sqsClient.sendMessage(SendMessageRequest.builder()
          .queueUrl("http://localhost:4566/000000000000/pulseboard-exports")
          .messageBody(payload)
          .build());
    } catch (Exception ex) {
      // keep request persisted even if enqueue fails
    }
    return new ExportDtos.ExportResponse(export.getId(), export.getBoardId(), export.getStatus(), export.getCreatedAt());
  }

  @Transactional(readOnly = true)
  public List<ExportDtos.ExportResponse> listExports(AuthPrincipal principal) {
    return exportRepository.findAllByTenantIdOrderByCreatedAtDesc(principal.tenantId()).stream()
        .map(e -> new ExportDtos.ExportResponse(e.getId(), e.getBoardId(), e.getStatus(), e.getCreatedAt()))
        .toList();
  }
}
