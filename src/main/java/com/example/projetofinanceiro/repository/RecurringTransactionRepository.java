package com.example.projetofinanceiro.repository;

import com.example.projetofinanceiro.model.RecurringTransaction;
import com.example.projetofinanceiro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {
    List<RecurringTransaction> findByUser(User user);
}
