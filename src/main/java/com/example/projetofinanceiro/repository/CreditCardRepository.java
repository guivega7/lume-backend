package com.example.projetofinanceiro.repository;

import com.example.projetofinanceiro.model.CreditCard;
import com.example.projetofinanceiro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditCardRepository extends JpaRepository<CreditCard, Long> {
    List<CreditCard> findByUser(User user);
}
