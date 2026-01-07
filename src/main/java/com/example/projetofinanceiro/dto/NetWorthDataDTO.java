package com.example.projetofinanceiro.dto;

import java.math.BigDecimal;

public record NetWorthDataDTO(
    BigDecimal totalBalance,
    BigDecimal totalAssets,
    BigDecimal netWorth,
    Double percentageChange
) {}
