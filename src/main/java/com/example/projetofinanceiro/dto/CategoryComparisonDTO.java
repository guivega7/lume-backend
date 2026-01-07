package com.example.projetofinanceiro.dto;

import java.math.BigDecimal;

public record CategoryComparisonDTO(
    String categoryName,
    BigDecimal currentAmount,
    BigDecimal previousAmount,
    Double percentageChange
) {}
