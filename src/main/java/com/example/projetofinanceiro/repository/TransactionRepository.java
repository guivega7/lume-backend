package com.example.projetofinanceiro.repository;

import com.example.projetofinanceiro.dto.CategoryTotalDTO;
import com.example.projetofinanceiro.dto.DailyMetric;
import com.example.projetofinanceiro.model.Account;
import com.example.projetofinanceiro.model.Category;
import com.example.projetofinanceiro.model.Transaction;
import com.example.projetofinanceiro.model.TransactionType;
import com.example.projetofinanceiro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user);
    
    @Query("SELECT t FROM Transaction t WHERE t.user = :user " +
           "AND t.date BETWEEN :startDate AND :endDate " +
           "AND (:categoryId IS NULL OR t.category.id = :categoryId) " +
           "ORDER BY t.date DESC")
    List<Transaction> findFiltered(User user, LocalDate startDate, LocalDate endDate, Long categoryId);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.date >= :startDate ORDER BY t.date DESC")
    List<Transaction> findRecentTransactionsByUser(User user, LocalDate startDate);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = com.example.projetofinanceiro.model.TransactionType.INCOME AND t.date BETWEEN :startDate AND :endDate")
    BigDecimal sumIncomeBetweenByUser(User user, LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = com.example.projetofinanceiro.model.TransactionType.EXPENSE AND t.date BETWEEN :startDate AND :endDate")
    BigDecimal sumExpenseBetweenByUser(User user, LocalDate startDate, LocalDate endDate);

    @Query("SELECT new com.example.projetofinanceiro.dto.CategoryTotalDTO(t.category.name, SUM(t.amount)) " +
           "FROM Transaction t " +
           "WHERE t.user = :user AND t.type = com.example.projetofinanceiro.model.TransactionType.EXPENSE AND t.date BETWEEN :startDate AND :endDate " +
           "GROUP BY t.category.name " +
           "ORDER BY SUM(t.amount) DESC")
    List<CategoryTotalDTO> findTopCategoriesByUser(User user, LocalDate startDate, LocalDate endDate);

    @Query("SELECT new com.example.projetofinanceiro.dto.DailyMetric(t.date, SUM(t.amount)) " +
           "FROM Transaction t " +
           "WHERE t.user = :user AND t.type = com.example.projetofinanceiro.model.TransactionType.EXPENSE AND t.date >= :startDate " +
           "GROUP BY t.date " +
           "ORDER BY t.date ASC")
    List<DailyMetric> findDailyExpensesByUser(User user, LocalDate startDate);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.account = :account AND t.type = com.example.projetofinanceiro.model.TransactionType.INCOME")
    BigDecimal sumIncomeByAccount(Account account);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.account = :account AND t.type = com.example.projetofinanceiro.model.TransactionType.EXPENSE")
    BigDecimal sumExpenseByAccount(Account account);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.category = :category AND t.type = com.example.projetofinanceiro.model.TransactionType.EXPENSE AND t.date BETWEEN :startDate AND :endDate")
    BigDecimal sumExpenseByCategoryAndDateRange(User user, Category category, LocalDate startDate, LocalDate endDate);

    List<Transaction> findByUserAndDateBetweenAndType(User user, LocalDate startDate, LocalDate endDate, TransactionType type);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.date >= :startDate AND t.date <= :endDate AND t.type = :type")
    List<Transaction> findByTypeAndDateRange(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, @Param("type") TransactionType type);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.date >= :startDate AND t.date <= :endDate")
    List<Transaction> findByDateRange(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.date >= :startDate AND t.date <= :endDate")
    List<Transaction> findAllByDateRange(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
