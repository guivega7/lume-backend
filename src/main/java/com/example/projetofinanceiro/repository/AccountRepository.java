package com.example.projetofinanceiro.repository;

import com.example.projetofinanceiro.model.Account;
import com.example.projetofinanceiro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUser(User user);

    @Query("SELECT SUM(a.initialBalance) FROM Account a WHERE a.user = :user")
    BigDecimal sumInitialBalanceByUser(User user);
}
