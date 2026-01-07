package com.example.projetofinanceiro.dto;

import java.math.BigDecimal;

public record NetWorthDTO(
    BigDecimal totalBalance,
    BigDecimal totalAssets,
    BigDecimal netWorth
) {}
