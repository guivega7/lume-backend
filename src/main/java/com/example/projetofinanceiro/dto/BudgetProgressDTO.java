package com.example.projetofinanceiro.dto;

import java.math.BigDecimal;

public record BudgetProgressDTO(
    Long id,
    String categoryName,
    Long categoryId,
    BigDecimal limitAmount,
    BigDecimal spentAmount,
    Double percentage
) {}
