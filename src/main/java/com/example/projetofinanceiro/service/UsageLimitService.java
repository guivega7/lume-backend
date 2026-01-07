package com.example.projetofinanceiro.service;

import com.example.projetofinanceiro.model.PlanType;
import com.example.projetofinanceiro.model.User;
import com.example.projetofinanceiro.repository.AccountRepository;
import com.example.projetofinanceiro.repository.CreditCardRepository;
import com.example.projetofinanceiro.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class UsageLimitService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CreditCardRepository creditCardRepository;

    private static final int MAX_TRANSACTIONS_FREE = 50;
    private static final int MAX_ACCOUNTS_FREE = 2;
    private static final int MAX_CARDS_FREE = 1;
    private static final int TRIAL_DAYS = 30;

    public void checkTransactionLimit(User user) {
        if (user.getPlanType() == PlanType.LIFETIME) return;
        if (user.getPlanType() == PlanType.PRO) return;

        checkTrialPeriod(user);

        long count = transactionRepository.findByUser(user).size();
        if (count >= MAX_TRANSACTIONS_FREE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Limite de transações do plano gratuito atingido (" + MAX_TRANSACTIONS_FREE + ").");
        }
    }

    public void checkAccountLimit(User user) {
        if (user.getPlanType() == PlanType.LIFETIME) return;
        if (user.getPlanType() == PlanType.PRO) return;

        checkTrialPeriod(user);

        long count = accountRepository.findByUser(user).size();
        if (count >= MAX_ACCOUNTS_FREE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Limite de contas do plano gratuito atingido (" + MAX_ACCOUNTS_FREE + ").");
        }
    }

    public void checkCreditCardLimit(User user) {
        if (user.getPlanType() == PlanType.LIFETIME) return;
        if (user.getPlanType() == PlanType.PRO) return;

        checkTrialPeriod(user);

        long count = creditCardRepository.findByUser(user).size();
        if (count >= MAX_CARDS_FREE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Limite de cartões do plano gratuito atingido (" + MAX_CARDS_FREE + ").");
        }
    }

    private void checkTrialPeriod(User user) {
        if (user.getCreatedAt() == null) return; // Legacy users
        
        long days = ChronoUnit.DAYS.between(user.getCreatedAt(), LocalDateTime.now());
        if (days > TRIAL_DAYS) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Período de testes encerrado. Faça o upgrade para continuar.");
        }
    }
}
