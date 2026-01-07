package com.example.projetofinanceiro.controller;

import com.example.projetofinanceiro.dto.BudgetProgressDTO;
import com.example.projetofinanceiro.model.Budget;
import com.example.projetofinanceiro.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetProgressDTO>> getBudgets(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year
    ) {
        if (month == null) month = LocalDate.now().getMonthValue();
        if (year == null) year = LocalDate.now().getYear();

        return ResponseEntity.ok(budgetService.getBudgetsWithProgress(month, year));
    }

    @PostMapping
    public ResponseEntity<Budget> createOrUpdateBudget(@RequestBody Map<String, Object> payload) {
        Long categoryId = Long.valueOf(payload.get("categoryId").toString());
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        
        int month = payload.containsKey("month") ? (int) payload.get("month") : LocalDate.now().getMonthValue();
        int year = payload.containsKey("year") ? (int) payload.get("year") : LocalDate.now().getYear();

        return ResponseEntity.ok(budgetService.createOrUpdateBudget(categoryId, amount, month, year));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}
