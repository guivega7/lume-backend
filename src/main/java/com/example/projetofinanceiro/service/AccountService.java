package com.example.projetofinanceiro.service;

import com.example.projetofinanceiro.model.Account;
import com.example.projetofinanceiro.model.User;
import com.example.projetofinanceiro.repository.AccountRepository;
import com.example.projetofinanceiro.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public List<Account> getAccountsByUser(User user) {
        List<Account> accounts = accountRepository.findByUser(user);
        
        // Calculate current balance for each account
        for (Account account : accounts) {
            BigDecimal income = transactionRepository.sumIncomeByAccount(account);
            BigDecimal expense = transactionRepository.sumExpenseByAccount(account);
            
            if (income == null) income = BigDecimal.ZERO;
            if (expense == null) expense = BigDecimal.ZERO;
            
            BigDecimal initial = account.getInitialBalance() != null ? account.getInitialBalance() : BigDecimal.ZERO;
            
            account.setCurrentBalance(initial.add(income).subtract(expense));
        }
        
        return accounts;
    }

    public Account createAccount(Account account, User user) {
        account.setUser(user);
        if (account.getInitialBalance() == null) {
            account.setInitialBalance(BigDecimal.ZERO);
        }
        return accountRepository.save(account);
    }

    @Transactional
    public void deleteAccount(Long id, User user) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));

        if (!account.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        accountRepository.delete(account);
    }
}
