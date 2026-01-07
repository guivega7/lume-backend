package com.example.projetofinanceiro.controller;

import com.example.projetofinanceiro.dto.TopCategoryDTO;
import com.example.projetofinanceiro.model.Transaction;
import com.example.projetofinanceiro.model.TransactionType;
import com.example.projetofinanceiro.model.User;
import com.example.projetofinanceiro.repository.TransactionRepository;
import com.example.projetofinanceiro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugController {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @GetMapping("/top-categories-last-month")
    public List<TopCategoryDTO> topCategories(@RequestParam(defaultValue = "demo@lume.com") String email) {
        User user = userRepository.findByEmail(email);
        LocalDate now = LocalDate.now();
        LocalDate startOfLastMonth = now.minusMonths(1).with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfLastMonth = now.minusMonths(1).with(TemporalAdjusters.lastDayOfMonth());

        List<Transaction> all = transactionRepository.findAllByDateRange(user, startOfLastMonth, endOfLastMonth);
        List<Transaction> expenses = all.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE || (t.getAmount() != null && t.getAmount().compareTo(BigDecimal.ZERO) < 0))
                .collect(Collectors.toList());

        Map<String, Double> categorySum = expenses.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getCategory() != null ? t.getCategory().getName() : "Sem Categoria",
                        Collectors.summingDouble(t -> t.getAmount() != null ? t.getAmount().abs().doubleValue() : 0.0)
                ));

        return categorySum.entrySet().stream()
                .map(e -> new TopCategoryDTO(e.getKey(), BigDecimal.valueOf(e.getValue())))
                .sorted((a,b) -> b.totalAmount().compareTo(a.totalAmount()))
                .limit(10)
                .collect(Collectors.toList());
    }
}

