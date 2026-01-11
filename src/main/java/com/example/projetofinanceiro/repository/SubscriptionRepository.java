package com.example.projetofinanceiro.repository;

import com.example.projetofinanceiro.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByNextPaymentDate(LocalDate nextPaymentDate);
}
