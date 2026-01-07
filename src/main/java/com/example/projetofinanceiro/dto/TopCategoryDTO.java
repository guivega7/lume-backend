package com.example.projetofinanceiro.dto;

import java.math.BigDecimal;

public record TopCategoryDTO(
    String categoryName,
    BigDecimal totalAmount
) {}
