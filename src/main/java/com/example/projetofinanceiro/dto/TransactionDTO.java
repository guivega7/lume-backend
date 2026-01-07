package com.example.projetofinanceiro.dto;

import com.example.projetofinanceiro.model.Transaction;
import com.example.projetofinanceiro.model.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionDTO(
    Long id,
    String description,
    BigDecimal amount,
    LocalDate date,
    TransactionType type,
    String accountName,
    CategoryDTO category
) {
    public static TransactionDTO fromEntity(Transaction transaction) {
        String sourceName = "N/A";
        
        if (transaction.getCreditCard() != null) {
            sourceName = "Cartão: " + transaction.getCreditCard().getName();
        } else if (transaction.getAccount() != null) {
            sourceName = transaction.getAccount().getName();
        }

        return new TransactionDTO(
            transaction.getId(),
            transaction.getDescription(),
            transaction.getAmount(),
            transaction.getDate(),
            transaction.getType(),
            sourceName,
            transaction.getCategory() != null ? CategoryDTO.fromEntity(transaction.getCategory()) : null
        );
    }
}
