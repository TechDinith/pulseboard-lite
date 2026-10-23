package com.pulseboard.backend.exports;

import com.pulseboard.backend.auth.AuthPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exports")
public class ExportController {

  private final ExportService exportService;

  public ExportController(ExportService exportService) {
    this.exportService = exportService;
  }

  @PostMapping
  public ExportDtos.ExportResponse request(@AuthenticationPrincipal AuthPrincipal principal, @RequestBody ExportDtos.ExportRequestBody body) {
    return exportService.requestExport(principal, body);
  }

  @GetMapping
  public List<ExportDtos.ExportResponse> list(@AuthenticationPrincipal AuthPrincipal principal) {
    return exportService.listExports(principal);
  }
}
