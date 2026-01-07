package com.example.projetofinanceiro.dto;

import java.math.BigDecimal;

public record CategoryReportDTO(
    String categoryName,
    BigDecimal totalValue,
    Double percentage
) {}
