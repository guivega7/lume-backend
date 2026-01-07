package com.example.projetofinanceiro.controller;

import com.example.projetofinanceiro.model.Account;
import com.example.projetofinanceiro.model.User;
import com.example.projetofinanceiro.repository.AccountRepository;
import com.example.projetofinanceiro.service.AccountService;
import com.example.projetofinanceiro.service.UsageLimitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final AccountRepository accountRepository;
    private final UsageLimitService usageLimitService;

    @GetMapping
    public List<Account> getAllAccounts() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return accountService.getAccountsByUser(user);
    }

    @PostMapping
    public Account createAccount(@RequestBody Account account) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        // Check Limits
        usageLimitService.checkAccountLimit(user);

        return accountService.createAccount(account, user);
    }

    @PutMapping("/{id}")
    public Account updateAccount(@PathVariable Long id, @RequestBody Account accountDetails) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));

        if (!account.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        account.setName(accountDetails.getName());
        account.setBank(accountDetails.getBank());
        account.setInitialBalance(accountDetails.getInitialBalance());
        account.setType(accountDetails.getType());
        
        return accountRepository.save(account);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        accountService.deleteAccount(id, user);
        return ResponseEntity.noContent().build();
    }
}
