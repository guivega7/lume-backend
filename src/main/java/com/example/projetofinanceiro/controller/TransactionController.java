package com.example.projetofinanceiro.controller;

import com.example.projetofinanceiro.dto.TransactionDTO;
import com.example.projetofinanceiro.model.*;
import com.example.projetofinanceiro.repository.*;
import com.example.projetofinanceiro.service.UsageLimitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.HtmlUtils;

import java.text.NumberFormat;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final NotificationRepository notificationRepository;
    private final CreditCardRepository creditCardRepository;
    private final UsageLimitService usageLimitService;

    @GetMapping
    public List<TransactionDTO> getAllTransactions(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Long categoryId
    ) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        // Default to current month if not provided
        if (month == null) month = LocalDate.now().getMonthValue();
        if (year == null) year = LocalDate.now().getYear();

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Transaction> transactions = transactionRepository.findFiltered(user, startDate, endDate, categoryId);
        
        return transactions.stream()
                .map(TransactionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @PostMapping
    public Transaction createTransaction(@RequestBody Transaction transaction) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        // Check Limits
        usageLimitService.checkTransactionLimit(user);

        transaction.setUser(user);
        
        // XSS Protection
        if (transaction.getDescription() != null) {
            transaction.setDescription(HtmlUtils.htmlEscape(transaction.getDescription()));
        }

        // Validate and link Account OR Credit Card
        if (transaction.getCreditCard() != null && transaction.getCreditCard().getId() != null) {
            CreditCard card = creditCardRepository.findById(transaction.getCreditCard().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Credit Card not found"));
            
            if (!card.getUser().getId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Credit Card does not belong to user");
            }
            transaction.setCreditCard(card);
            transaction.setAccount(null); // Ensure account is null if credit card is used

            // Update Limit Used
            if (transaction.getType() == TransactionType.EXPENSE) {
                card.setLimitUsed(card.getLimitUsed().add(transaction.getAmount()));
                creditCardRepository.save(card);
            }

        } else if (transaction.getAccount() != null && transaction.getAccount().getId() != null) {
            Account account = accountRepository.findById(transaction.getAccount().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
            
            if (!account.getUser().getId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account does not belong to user");
            }
            transaction.setAccount(account);
            transaction.setCreditCard(null);
        }

        // Validate and link Category
        if (transaction.getCategory() != null && transaction.getCategory().getId() != null) {
            Category category = categoryRepository.findById(transaction.getCategory().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
            
             if (!category.getUser().getId().equals(user.getId())) {
                 throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Category does not belong to user");
             }
            transaction.setCategory(category);
        } else {
            transaction.setCategory(null);
        }

        Transaction savedTransaction = transactionRepository.save(transaction);

        // Create Notification for Expenses
        if (savedTransaction.getType() == TransactionType.EXPENSE) {
            NumberFormat format = NumberFormat.getCurrencyInstance(new Locale("pt", "BR"));
            String amountStr = format.format(savedTransaction.getAmount());
            String source = savedTransaction.getCreditCard() != null ? "no cartão " + savedTransaction.getCreditCard().getName() : "na conta";
            String message = "Você registrou uma nova despesa de " + amountStr + " " + source;
            
            Notification notification = new Notification(message, user);
            notificationRepository.save(notification);
        }

        return savedTransaction;
    }

    @PutMapping("/{id}")
    public Transaction updateTransaction(@PathVariable Long id, @RequestBody Transaction transactionDetails) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Transaction does not belong to user");
        }

        // Revert old credit card limit usage if applicable
        if (transaction.getCreditCard() != null && transaction.getType() == TransactionType.EXPENSE) {
            CreditCard oldCard = transaction.getCreditCard();
            oldCard.setLimitUsed(oldCard.getLimitUsed().subtract(transaction.getAmount()));
            creditCardRepository.save(oldCard);
        }

        // XSS Protection
        if (transactionDetails.getDescription() != null) {
            transaction.setDescription(HtmlUtils.htmlEscape(transactionDetails.getDescription()));
        } else {
            transaction.setDescription(transactionDetails.getDescription());
        }

        transaction.setAmount(transactionDetails.getAmount());
        transaction.setDate(transactionDetails.getDate());
        transaction.setType(transactionDetails.getType());

        // Update Account OR Credit Card
        if (transactionDetails.getCreditCard() != null && transactionDetails.getCreditCard().getId() != null) {
            CreditCard card = creditCardRepository.findById(transactionDetails.getCreditCard().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Credit Card not found"));
            
            if (!card.getUser().getId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Credit Card does not belong to user");
            }
            transaction.setCreditCard(card);
            transaction.setAccount(null);

            // Update New Limit Used
            if (transaction.getType() == TransactionType.EXPENSE) {
                card.setLimitUsed(card.getLimitUsed().add(transaction.getAmount()));
                creditCardRepository.save(card);
            }

        } else if (transactionDetails.getAccount() != null && transactionDetails.getAccount().getId() != null) {
            Account account = accountRepository.findById(transactionDetails.getAccount().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
            if (!account.getUser().getId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account does not belong to user");
            }
            transaction.setAccount(account);
            transaction.setCreditCard(null);
        }

        // Update Category
        if (transactionDetails.getCategory() != null && transactionDetails.getCategory().getId() != null) {
            Category category = categoryRepository.findById(transactionDetails.getCategory().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
            if (!category.getUser().getId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Category does not belong to user");
            }
            transaction.setCategory(category);
        } else {
            transaction.setCategory(null);
        }

        return transactionRepository.save(transaction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Transaction does not belong to user");
        }

        // Revert credit card limit usage if applicable
        if (transaction.getCreditCard() != null && transaction.getType() == TransactionType.EXPENSE) {
            CreditCard card = transaction.getCreditCard();
            card.setLimitUsed(card.getLimitUsed().subtract(transaction.getAmount()));
            creditCardRepository.save(card);
        }

        transactionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
