package com.example.projetofinanceiro.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class CategoryTotalDTO {
    private String categoryName;
    private BigDecimal totalAmount;
}
