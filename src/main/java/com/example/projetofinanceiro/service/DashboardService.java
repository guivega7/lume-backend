package com.example.projetofinanceiro.service;

import com.example.projetofinanceiro.dto.*;
import com.example.projetofinanceiro.model.*;
import com.example.projetofinanceiro.repository.AccountRepository;
import com.example.projetofinanceiro.repository.AssetRepository;
import com.example.projetofinanceiro.repository.RecurringTransactionRepository;
import com.example.projetofinanceiro.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final AssetRepository assetRepository;
    private final RecurringTransactionRepository recurringRepository;

    public DashboardV2DTO getDashboardV2Data() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        LocalDate now = LocalDate.now();
        
        // Date Ranges
        LocalDate startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = now.with(TemporalAdjusters.lastDayOfMonth());
        
        LocalDate startOfLastMonth = now.minusMonths(1).with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfLastMonth = now.minusMonths(1).with(TemporalAdjusters.lastDayOfMonth());

        // 1. Ritmo de Gastos (Spending Pace) - Last 30 Days
        LocalDate thirtyDaysAgo = now.minusDays(29);
        List<Transaction> last30DaysExpenses = transactionRepository.findByTypeAndDateRange(user, thirtyDaysAgo, now, TransactionType.EXPENSE);

        Map<LocalDate, BigDecimal> expenseMap = last30DaysExpenses.stream()
                .collect(Collectors.groupingBy(
                        Transaction::getDate,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        List<ChartDataDTO> dailyExpenses = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            LocalDate date = thirtyDaysAgo.plusDays(i);
            BigDecimal value = expenseMap.getOrDefault(date, BigDecimal.ZERO);
            String label = date.format(DateTimeFormatter.ofPattern("dd/MM"));
            dailyExpenses.add(new ChartDataDTO(label, value));
        }

        // 2. Monthly Totals & Comparison
        List<Transaction> currentMonthTransactions = transactionRepository.findByDateRange(user, startOfMonth, endOfMonth);
        List<Transaction> lastMonthTransactions = transactionRepository.findByDateRange(user, startOfLastMonth, endOfLastMonth);

        BigDecimal totalSpentCurrent = currentMonthTransactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalSpentPrevious = lastMonthTransactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Double spendingChange = 0.0;
        if (totalSpentPrevious.compareTo(BigDecimal.ZERO) > 0) {
            spendingChange = totalSpentCurrent.subtract(totalSpentPrevious)
                    .divide(totalSpentPrevious, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100)).doubleValue();
        }

        BigDecimal incomeCurrent = currentMonthTransactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal monthlyResult = incomeCurrent.subtract(totalSpentCurrent);

        // 3. Net Worth Logic (With Variation)
        NetWorthDataDTO netWorthData = calculateNetWorth(user, incomeCurrent, totalSpentCurrent);

        // 4. Top Categories Comparison (Last Month vs Current Month)
        // Correção A: Lógica do Top Categorias (Mês Passado) - "Rede de Pesca"
        List<Transaction> allTransactionsLastMonth = transactionRepository.findAllByDateRange(user, startOfLastMonth, endOfLastMonth);

        System.out.println("DEBUG FATAL: Total de itens encontrados no mes passado: " + allTransactionsLastMonth.size());

        // Filtre no Java (Mais seguro)
        List<Transaction> expensesLastMonth = allTransactionsLastMonth.stream()
            .filter(t -> t.getType() == TransactionType.EXPENSE || t.getAmount().compareTo(BigDecimal.ZERO) < 0)
            .collect(Collectors.toList());

        System.out.println("DEBUG FATAL: Itens considerados Despesa: " + expensesLastMonth.size());

        // Agrupe por Categoria
        Map<String, Double> categorySum = expensesLastMonth.stream()
            .collect(Collectors.groupingBy(
                t -> t.getCategory() != null ? t.getCategory().getName() : "Sem Categoria",
                Collectors.summingDouble(t -> t.getAmount().abs().doubleValue())
            ));

        // Converta para o DTO e ordene
        List<TopCategoryDTO> topCategories = categorySum.entrySet().stream()
            .map(entry -> new TopCategoryDTO(entry.getKey(), BigDecimal.valueOf(entry.getValue())))
            .sorted((c1, c2) -> c2.totalAmount().compareTo(c1.totalAmount()))
            .limit(5)
            .collect(Collectors.toList());

        // 5. Recent Transactions
        List<Transaction> recentTx = transactionRepository.findRecentTransactionsByUser(user, now.minusDays(7));
        List<TransactionDTO> recentDTOs = recentTx.stream().limit(5).map(TransactionDTO::fromEntity).collect(Collectors.toList());

        // 6. Upcoming Expenses
        List<RecurringTransaction> recurring = recurringRepository.findByUser(user);
        List<RecurringTransaction> upcoming = recurring.stream()
                .filter(r -> r.getDueDay() >= now.getDayOfMonth() && r.getDueDay() <= now.plusDays(14).getDayOfMonth())
                .sorted(Comparator.comparingInt(RecurringTransaction::getDueDay))
                .collect(Collectors.toList());

        return new DashboardV2DTO(
            dailyExpenses,
            new ArrayList<>(), 
            totalSpentCurrent,
            spendingChange,
            new ArrayList<>(), 
            incomeCurrent,
            totalSpentCurrent,
            monthlyResult,
            topCategories, // Using the new list
            recentDTOs,
            upcoming,
            netWorthData
        );
    }

    private NetWorthDataDTO calculateNetWorth(User user, BigDecimal monthlyIncome, BigDecimal monthlyExpense) {
        // Correção B: Lógica do Patrimônio Total
        // 1. Soma Saldo das Contas
        BigDecimal totalAccounts = accountRepository.findByUser(user).stream()
            .map(acc -> {
                BigDecimal income = transactionRepository.sumIncomeByAccount(acc);
                BigDecimal expense = transactionRepository.sumExpenseByAccount(acc);
                if (income == null) income = BigDecimal.ZERO;
                if (expense == null) expense = BigDecimal.ZERO;
                BigDecimal initial = acc.getInitialBalance() != null ? acc.getInitialBalance() : BigDecimal.ZERO;
                return initial.add(income).subtract(expense);
            })
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Soma Valor dos Ativos (Carros, Casas, Investimentos)
        BigDecimal totalAssets = assetRepository.findByUser(user).stream()
            .map(Asset::getValue)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Patrimônio Real = Contas + Ativos
        BigDecimal currentNetWorth = totalAccounts.add(totalAssets);

        // 3. Calculate Start of Month Net Worth (Reverse Engineering)
        BigDecimal monthlyNetChange = monthlyIncome.subtract(monthlyExpense);
        BigDecimal startMonthNetWorth = currentNetWorth.subtract(monthlyNetChange);

        Double percentageChange = 0.0;
        if (startMonthNetWorth.compareTo(BigDecimal.ZERO) != 0) {
            percentageChange = currentNetWorth.subtract(startMonthNetWorth)
                    .divide(startMonthNetWorth, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100)).doubleValue();
        } else if (currentNetWorth.compareTo(BigDecimal.ZERO) != 0) {
            percentageChange = 100.0;
        }

        return new NetWorthDataDTO(totalAccounts, totalAssets, currentNetWorth, percentageChange);
    }

    private List<DailyMetric> fillMissingDays(List<DailyMetric> existingData, LocalDate start, LocalDate end) {
        return new ArrayList<>(); 
    }

    private List<DailyMetric> accumulateMetrics(List<DailyMetric> daily) {
        return new ArrayList<>();
    }
}
