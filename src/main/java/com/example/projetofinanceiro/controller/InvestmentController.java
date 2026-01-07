package com.example.projetofinanceiro.controller;

import com.example.projetofinanceiro.model.Investment;
import com.example.projetofinanceiro.model.User;
import com.example.projetofinanceiro.repository.InvestmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/investments")
@RequiredArgsConstructor
public class InvestmentController {

    private final InvestmentRepository investmentRepository;

    @GetMapping
    public List<Investment> getAllInvestments() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return investmentRepository.findByUser(user);
    }

    @PostMapping
    public Investment createInvestment(@RequestBody Investment investment) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        investment.setUser(user);
        return investmentRepository.save(investment);
    }

    @PutMapping("/{id}")
    public Investment updateInvestment(@PathVariable Long id, @RequestBody Investment investmentDetails) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Investment investment = investmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Investment not found"));

        if (!investment.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        investment.setName(investmentDetails.getName());
        investment.setType(investmentDetails.getType());
        investment.setCurrentValue(investmentDetails.getCurrentValue());
        investment.setInvestedAmount(investmentDetails.getInvestedAmount());
        
        return investmentRepository.save(investment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvestment(@PathVariable Long id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Investment investment = investmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Investment not found"));

        if (!investment.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        investmentRepository.delete(investment);
        return ResponseEntity.noContent().build();
    }
}
