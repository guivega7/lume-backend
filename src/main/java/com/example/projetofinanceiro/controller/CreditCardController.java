package com.example.projetofinanceiro.controller;

import com.example.projetofinanceiro.model.CreditCard;
import com.example.projetofinanceiro.model.User;
import com.example.projetofinanceiro.repository.CreditCardRepository;
import com.example.projetofinanceiro.service.UsageLimitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/credit-cards")
@RequiredArgsConstructor
public class CreditCardController {

    private final CreditCardRepository creditCardRepository;
    private final UsageLimitService usageLimitService;

    @GetMapping
    public List<CreditCard> getAllCards() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return creditCardRepository.findByUser(user);
    }

    @PostMapping
    public CreditCard createCard(@RequestBody CreditCard card) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        // Check Limits
        usageLimitService.checkCreditCardLimit(user);

        card.setUser(user);
        return creditCardRepository.save(card);
    }

    @PutMapping("/{id}")
    public CreditCard updateCard(@PathVariable Long id, @RequestBody CreditCard cardDetails) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        CreditCard card = creditCardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));

        if (!card.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        card.setName(cardDetails.getName());
        card.setLastFourDigits(cardDetails.getLastFourDigits());
        card.setLimitTotal(cardDetails.getLimitTotal());
        card.setClosingDay(cardDetails.getClosingDay());
        card.setDueDay(cardDetails.getDueDay());
        card.setColor(cardDetails.getColor());

        return creditCardRepository.save(card);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCard(@PathVariable Long id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        CreditCard card = creditCardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));

        if (!card.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        creditCardRepository.delete(card);
        return ResponseEntity.noContent().build();
    }
}
