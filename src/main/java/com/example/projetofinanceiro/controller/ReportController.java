package com.example.projetofinanceiro.controller;

import com.example.projetofinanceiro.dto.CashFlowDTO;
import com.example.projetofinanceiro.dto.CategoryReportDTO;
import com.example.projetofinanceiro.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/cash-flow")
    public ResponseEntity<List<CashFlowDTO>> getCashFlow(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        if (startDate == null) {
            startDate = LocalDate.now().withDayOfMonth(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        }

        return ResponseEntity.ok(reportService.generateCashFlow(startDate, endDate));
    }

    @GetMapping("/expenses-by-category")
    public ResponseEntity<List<CategoryReportDTO>> getExpensesByCategory(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year
    ) {
        if (month == null) month = LocalDate.now().getMonthValue();
        if (year == null) year = LocalDate.now().getYear();

        return ResponseEntity.ok(reportService.getExpensesByCategory(month, year));
    }
}
