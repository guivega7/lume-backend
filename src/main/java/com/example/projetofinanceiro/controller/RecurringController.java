package com.example.projetofinanceiro.controller;

import com.example.projetofinanceiro.model.RecurringTransaction;
import com.example.projetofinanceiro.model.Transaction;
import com.example.projetofinanceiro.model.User;
import com.example.projetofinanceiro.repository.RecurringTransactionRepository;
import com.example.projetofinanceiro.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recurring")
@RequiredArgsConstructor
public class RecurringController {

    private final RecurringTransactionRepository recurringRepository;
    private final TransactionRepository transactionRepository;

    @GetMapping
    public List<RecurringTransaction> getAllRecurring() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return recurringRepository.findByUser(user);
    }

    @PostMapping
    public RecurringTransaction createRecurring(@RequestBody RecurringTransaction recurring) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        recurring.setUser(user);
        return recurringRepository.save(recurring);
    }

    @PutMapping("/{id}")
    public RecurringTransaction updateRecurring(@PathVariable Long id, @RequestBody RecurringTransaction details) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        RecurringTransaction recurring = recurringRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recurring transaction not found"));

        if (!recurring.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        recurring.setDescription(details.getDescription());
        recurring.setAmount(details.getAmount());
        recurring.setType(details.getType());
        recurring.setCategory(details.getCategory());
        recurring.setDueDay(details.getDueDay());
        recurring.setFrequency(details.getFrequency());

        return recurringRepository.save(recurring);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecurring(@PathVariable Long id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        RecurringTransaction recurring = recurringRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recurring transaction not found"));

        if (!recurring.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        recurringRepository.delete(recurring);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/create-transaction")
    public Transaction createTransactionFromRecurring(@PathVariable Long id, @RequestBody Map<String, Integer> dateParams) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        RecurringTransaction recurring = recurringRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recurring transaction not found"));

        if (!recurring.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        int year = dateParams.getOrDefault("year", LocalDate.now().getYear());
        int month = dateParams.getOrDefault("month", LocalDate.now().getMonthValue());
        
        // Create date from year, month and dueDay
        // Handle invalid days (e.g., Feb 30) by clamping to last day of month
        LocalDate date = LocalDate.of(year, month, 1);
        int lastDayOfMonth = date.lengthOfMonth();
        int day = Math.min(recurring.getDueDay(), lastDayOfMonth);
        date = date.withDayOfMonth(day);

        Transaction transaction = new Transaction();
        transaction.setDescription(recurring.getDescription());
        transaction.setAmount(recurring.getAmount());
        transaction.setType(recurring.getType());
        transaction.setCategory(recurring.getCategory());
        transaction.setDate(date);
        transaction.setUser(user);
        // Note: Account is left null, user might need to assign it later or we could add default account to Recurring

        return transactionRepository.save(transaction);
    }
}
