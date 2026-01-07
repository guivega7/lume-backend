package com.example.projetofinanceiro.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Entity
@Table(name = "accounts")
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    
    private String bank; // Nome do banco ou instituição

    private BigDecimal initialBalance = BigDecimal.ZERO; // Saldo inicial definido pelo usuário

    @Transient // Não salva no banco, é calculado em tempo de execução
    private BigDecimal currentBalance;

    private String type; // e.g., CHECKING, SAVINGS, CREDIT_CARD

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Transaction> transactions;
}
