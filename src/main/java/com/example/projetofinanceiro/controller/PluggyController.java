package com.example.projetofinanceiro.controller;

import com.example.projetofinanceiro.dto.PluggySyncDTO;
import com.example.projetofinanceiro.model.User;
import com.example.projetofinanceiro.service.PluggyIntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/pluggy")
@RequiredArgsConstructor
public class PluggyController {

    private final PluggyIntegrationService pluggyIntegrationService;

    @GetMapping("/token")
    public ResponseEntity<Map<String, String>> getConnectToken() {
        String token = pluggyIntegrationService.criarConnectToken();
        return ResponseEntity.ok(Map.of("accessToken", token));
    }

    @PostMapping("/sync")
    public ResponseEntity<Map<String, String>> syncTransactions(
            @RequestBody PluggySyncDTO dto,
            @AuthenticationPrincipal User user
    ) {
        if (dto.accountId() == null || dto.accountId().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Account ID is required"));
        }

        // Chama o serviço de sincronização de forma síncrona (pode demorar um pouco)
        // Em produção, idealmente isso seria assíncrono (Job/Queue), mas para MVP está ok.
        pluggyIntegrationService.sincronizarTransacoes(dto.accountId(), user);

        return ResponseEntity.ok(Map.of("message", "Sincronização iniciada com sucesso para a conta " + dto.accountId()));
    }
}
