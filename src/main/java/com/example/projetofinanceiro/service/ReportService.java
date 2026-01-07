package com.example.projetofinanceiro.service;

import com.example.projetofinanceiro.dto.CashFlowDTO;
import com.example.projetofinanceiro.dto.CategoryReportDTO;
import com.example.projetofinanceiro.model.Transaction;
import com.example.projetofinanceiro.model.TransactionType;
import com.example.projetofinanceiro.model.User;
import com.example.projetofinanceiro.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepository;

    public List<CashFlowDTO> generateCashFlow(LocalDate startDate, LocalDate endDate) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        List<Transaction> transactions = transactionRepository.findByUser(user).stream()
                .filter(t -> !t.getDate().isBefore(startDate) && !t.getDate().isAfter(endDate))
                .collect(Collectors.toList());

        Map<LocalDate, List<Transaction>> transactionsByDate = transactions.stream()
                .collect(Collectors.groupingBy(Transaction::getDate));

        List<CashFlowDTO> cashFlow = new ArrayList<>();
        
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            List<Transaction> dailyTransactions = transactionsByDate.getOrDefault(current, new ArrayList<>());

            BigDecimal income = dailyTransactions.stream()
                    .filter(t -> t.getType() == TransactionType.INCOME)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal expense = dailyTransactions.stream()
                    .filter(t -> t.getType() == TransactionType.EXPENSE)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal net = income.subtract(expense);

            cashFlow.add(new CashFlowDTO(current, income, expense, net));
            current = current.plusDays(1);
        }

        return cashFlow;
    }

    public List<CategoryReportDTO> getExpensesByCategory(int month, int year) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Transaction> expenses = transactionRepository.findByUser(user).stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .filter(t -> !t.getDate().isBefore(startDate) && !t.getDate().isAfter(endDate))
                .collect(Collectors.toList());

        BigDecimal totalExpenses = expenses.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalExpenses.compareTo(BigDecimal.ZERO) == 0) {
            return new ArrayList<>();
        }

        Map<String, BigDecimal> expensesByCategory = expenses.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getCategory() != null ? t.getCategory().getName() : "Sem Categoria",
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        return expensesByCategory.entrySet().stream()
                .map(entry -> {
                    BigDecimal value = entry.getValue();
                    Double percentage = value.divide(totalExpenses, 4, RoundingMode.HALF_UP)
                            .multiply(new BigDecimal(100))
                            .doubleValue();
                    return new CategoryReportDTO(entry.getKey(), value, percentage);
                })
                .sorted((a, b) -> b.totalValue().compareTo(a.totalValue()))
                .collect(Collectors.toList());
    }
}
