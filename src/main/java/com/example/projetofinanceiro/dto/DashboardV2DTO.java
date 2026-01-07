package com.example.projetofinanceiro.dto;

import com.example.projetofinanceiro.model.RecurringTransaction;

import java.math.BigDecimal;
import java.util.List;

public record DashboardV2DTO(
    List<ChartDataDTO> dailyExpenses,
    List<DailyMetric> spendingPacePreviousMonth,
    BigDecimal totalSpentCurrentMonth,
    Double spendingChangePercentage,
    List<DailyMetric> netWorthEvolution,
    BigDecimal monthlyIncome,
    BigDecimal monthlyExpense,
    BigDecimal monthlyResult,
    List<TopCategoryDTO> topCategories, // Changed to TopCategoryDTO
    List<TransactionDTO> recentTransactions,
    List<RecurringTransaction> upcomingExpenses,
    NetWorthDataDTO netWorthData
) {}
