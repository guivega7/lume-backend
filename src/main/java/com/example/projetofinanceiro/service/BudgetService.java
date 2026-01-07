package com.example.projetofinanceiro.service;

import com.example.projetofinanceiro.dto.BudgetProgressDTO;
import com.example.projetofinanceiro.model.Budget;
import com.example.projetofinanceiro.model.Category;
import com.example.projetofinanceiro.model.TransactionType;
import com.example.projetofinanceiro.model.User;
import com.example.projetofinanceiro.repository.BudgetRepository;
import com.example.projetofinanceiro.repository.CategoryRepository;
import com.example.projetofinanceiro.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public List<BudgetProgressDTO> getBudgetsWithProgress(int month, int year) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<Budget> budgets = budgetRepository.findByUserAndMonthAndYear(user, month, year);

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        return budgets.stream().map(budget -> {
            // Calculate spent amount for this category in this month
            BigDecimal spent = transactionRepository.sumExpenseBetweenByUser(user, startDate, endDate);
            
            // The repository method sums ALL expenses. We need to filter by category.
            // Since we don't have a specific repo method for sum by category and date range yet,
            // let's create a specific query or filter in memory (less efficient but works for MVP)
            // Better: Add a specific query in TransactionRepository.
            
            // Let's use a new repository method we'll add next.
            BigDecimal categorySpent = transactionRepository.sumExpenseByCategoryAndDateRange(
                user, budget.getCategory(), startDate, endDate
            );
            
            if (categorySpent == null) categorySpent = BigDecimal.ZERO;

            double percentage = 0.0;
            if (budget.getAmount().compareTo(BigDecimal.ZERO) > 0) {
                percentage = categorySpent.divide(budget.getAmount(), 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal(100)).doubleValue();
            }

            return new BudgetProgressDTO(
                budget.getId(),
                budget.getCategory().getName(),
                budget.getCategory().getId(),
                budget.getAmount(),
                categorySpent,
                percentage
            );
        }).collect(Collectors.toList());
    }

    public Budget createOrUpdateBudget(Long categoryId, BigDecimal amount, int month, int year) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        if (!category.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        return budgetRepository.findByUserAndCategoryAndMonthAndYear(user, category, month, year)
                .map(existingBudget -> {
                    existingBudget.setAmount(amount);
                    return budgetRepository.save(existingBudget);
                })
                .orElseGet(() -> {
                    Budget newBudget = new Budget();
                    newBudget.setUser(user);
                    newBudget.setCategory(category);
                    newBudget.setAmount(amount);
                    newBudget.setMonth(month);
                    newBudget.setYear(year);
                    return budgetRepository.save(newBudget);
                });
    }
    
    public void deleteBudget(Long id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget not found"));
                
        if (!budget.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        budgetRepository.delete(budget);
    }
}
