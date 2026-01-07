package com.example.projetofinanceiro.dto;

import com.example.projetofinanceiro.model.Category;
import com.example.projetofinanceiro.model.TransactionType;

public record CategoryDTO(
    Long id,
    String name,
    TransactionType type
) {
    public static CategoryDTO fromEntity(Category category) {
        return new CategoryDTO(category.getId(), category.getName(), category.getType());
    }
}
