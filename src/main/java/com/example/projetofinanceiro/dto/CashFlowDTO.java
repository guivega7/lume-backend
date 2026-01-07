package com.example.projetofinanceiro.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CashFlowDTO(
    LocalDate date,
    BigDecimal totalIncome,
    BigDecimal totalExpense,
    BigDecimal netBalance
) {}
