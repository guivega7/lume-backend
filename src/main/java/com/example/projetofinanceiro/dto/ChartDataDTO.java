package com.example.projetofinanceiro.dto;

import java.math.BigDecimal;

public record ChartDataDTO(
    String date,
    BigDecimal total
) {}
