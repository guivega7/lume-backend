package com.example.projetofinanceiro.controller;

import com.example.projetofinanceiro.dto.DashboardV2DTO;
import com.example.projetofinanceiro.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardV2DTO> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboardV2Data());
    }
}
