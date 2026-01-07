package com.example.projetofinanceiro.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "credit_cards")
@NoArgsConstructor
public class CreditCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String lastFourDigits;
    private BigDecimal limitTotal;
    private BigDecimal limitUsed = BigDecimal.ZERO;
    private int closingDay; // Dia do fechamento da fatura
    private int dueDay; // Dia do vencimento da fatura
    private String color; // Hex color code

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
}
