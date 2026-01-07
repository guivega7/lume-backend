package com.example.projetofinanceiro.config;

import com.example.projetofinanceiro.model.*;
import com.example.projetofinanceiro.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final AssetRepository assetRepository;
    private final RecurringTransactionRepository recurringRepository;
    private final BudgetRepository budgetRepository;
    private final CreditCardRepository creditCardRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            System.out.println("Iniciando DatabaseSeeder...");
            
            // Email atualizado para demo@lume.app
            String demoEmail = "demo@lume.app";
            User existingUser = userRepository.findByEmail(demoEmail);

            if (existingUser != null) {
                System.out.println("Limpando dados antigos do usuário demo...");
                transactionRepository.deleteAll(transactionRepository.findByUser(existingUser));
                assetRepository.deleteAll(assetRepository.findByUser(existingUser));
                recurringRepository.deleteAll(recurringRepository.findByUser(existingUser));
                creditCardRepository.deleteAll(creditCardRepository.findByUser(existingUser));
                budgetRepository.deleteAll(budgetRepository.findByUserAndMonthAndYear(existingUser, LocalDate.now().getMonthValue(), LocalDate.now().getYear()));
                
                accountRepository.deleteAll(accountRepository.findByUser(existingUser));
                categoryRepository.deleteAll(categoryRepository.findByUser(existingUser));
                
                userRepository.delete(existingUser);
                userRepository.flush();
            }

            System.out.println("Criando novo usuário demo...");
            User newUser = new User();
            newUser.setName("Usuário Demo");
            newUser.setEmail(demoEmail);
            newUser.setPassword(passwordEncoder.encode("demo123"));
            User demoUser = userRepository.save(newUser);

            // 2. Criar Conta Bancária
            Account demoAccount = new Account();
            demoAccount.setName("Conta Principal");
            demoAccount.setBank("Nubank");
            demoAccount.setInitialBalance(new BigDecimal("1500.00"));
            demoAccount.setType("CHECKING");
            demoAccount.setUser(demoUser);
            demoAccount = accountRepository.save(demoAccount);

            // 3. Criar Categorias
            Category catSalario = new Category("Salário", TransactionType.INCOME, demoUser);
            Category catAlimentacao = new Category("Alimentação", TransactionType.EXPENSE, demoUser);
            Category catLazer = new Category("Lazer", TransactionType.EXPENSE, demoUser);
            Category catTransporte = new Category("Transporte", TransactionType.EXPENSE, demoUser);
            Category catMoradia = new Category("Moradia", TransactionType.EXPENSE, demoUser);
            Category catServicos = new Category("Serviços", TransactionType.EXPENSE, demoUser);
            
            List<Category> categories = Arrays.asList(catSalario, catAlimentacao, catLazer, catTransporte, catMoradia, catServicos);
            categoryRepository.saveAll(categories);

            // 4. Criar Ativos (Patrimônio)
            Asset car = new Asset();
            car.setName("Honda Civic 2020");
            car.setValue(new BigDecimal("85000.00"));
            car.setType(AssetType.VEHICLE);
            car.setUser(demoUser);
            assetRepository.save(car);

            Asset investments = new Asset();
            investments.setName("Reserva de Emergência");
            investments.setValue(new BigDecimal("15000.00"));
            investments.setType(AssetType.INVESTMENT);
            investments.setUser(demoUser);
            assetRepository.save(investments);

            // 5. Criar Cartão de Crédito
            CreditCard nubankCard = new CreditCard();
            nubankCard.setName("Nubank Ultravioleta");
            nubankCard.setColor("#820ad1");
            nubankCard.setLastFourDigits("8829");
            nubankCard.setLimitTotal(new BigDecimal("15000.00"));
            nubankCard.setLimitUsed(BigDecimal.ZERO);
            nubankCard.setClosingDay(1);
            nubankCard.setDueDay(10);
            nubankCard.setUser(demoUser);
            nubankCard = creditCardRepository.save(nubankCard);

            // 6. Criar Transações no Cartão
            LocalDate now = LocalDate.now();
            
            createCardTransaction(demoUser, nubankCard, catServicos, "Apple Store", new BigDecimal("49.90"), now.minusDays(1));
            createCardTransaction(demoUser, nubankCard, catLazer, "Jantar Outback", new BigDecimal("320.50"), now.minusDays(2));
            createCardTransaction(demoUser, nubankCard, catTransporte, "Uber Viagem", new BigDecimal("45.20"), now);

            nubankCard.setLimitUsed(new BigDecimal("415.60"));
            creditCardRepository.save(nubankCard);

            // 7. Criar Despesa Recorrente
            RecurringTransaction spotify = new RecurringTransaction();
            spotify.setDescription("Spotify Premium");
            spotify.setAmount(new BigDecimal("21.90"));
            spotify.setType(TransactionType.EXPENSE);
            spotify.setFrequency(Frequency.MONTHLY);
            spotify.setCategory(catLazer);
            spotify.setDueDay(15);
            spotify.setUser(demoUser);
            recurringRepository.save(spotify);

            // 8. Criar Meta de Gastos
            Budget foodBudget = new Budget();
            foodBudget.setCategory(catAlimentacao);
            foodBudget.setAmount(new BigDecimal("800.00"));
            foodBudget.setMonth(now.getMonthValue());
            foodBudget.setYear(now.getYear());
            foodBudget.setUser(demoUser);
            budgetRepository.save(foodBudget);

            // 9. Criar Transações na Conta
            Random random = new Random();
            LocalDate lastMonth = now.minusMonths(1).withDayOfMonth(15);
            for (int i = 0; i < 15; i++) {
                LocalDate date = lastMonth.plusDays(random.nextInt(10) - 5);
                createTransaction(demoUser, demoAccount, catAlimentacao, "Mercado", new BigDecimal(50 + random.nextInt(200)), TransactionType.EXPENSE, date);
                if (i % 3 == 0) createTransaction(demoUser, demoAccount, catLazer, "Cinema/Jantar", new BigDecimal(30 + random.nextInt(100)), TransactionType.EXPENSE, date);
                if (i % 5 == 0) createTransaction(demoUser, demoAccount, catTransporte, "Uber", new BigDecimal(15 + random.nextInt(30)), TransactionType.EXPENSE, date);
            }
            createTransaction(demoUser, demoAccount, catSalario, "Salário", new BigDecimal("4500.00"), TransactionType.INCOME, lastMonth.withDayOfMonth(5));

            createTransaction(demoUser, demoAccount, catSalario, "Salário", new BigDecimal("4500.00"), TransactionType.INCOME, now.withDayOfMonth(5));
            
            for (int i = 0; i < 20; i++) {
                LocalDate date = now.minusDays(i);
                if (random.nextDouble() > 0.3) {
                    createTransaction(demoUser, demoAccount, catAlimentacao, "Padaria/Almoço", new BigDecimal(20 + random.nextInt(50)), TransactionType.EXPENSE, date);
                }
                if (i == 2) createTransaction(demoUser, demoAccount, catTransporte, "Abastecimento", new BigDecimal("250.00"), TransactionType.EXPENSE, date);
                if (i == 10) createTransaction(demoUser, demoAccount, catMoradia, "Aluguel", new BigDecimal("1200.00"), TransactionType.EXPENSE, date);
                if (i == 15) createTransaction(demoUser, demoAccount, catLazer, "Assinaturas", new BigDecimal("89.90"), TransactionType.EXPENSE, date);
            }

            System.out.println("Usuário de demonstração criado com sucesso!");

        } catch (Exception e) {
            System.err.println("ERRO CRÍTICO NO DATABASE SEEDER:");
            e.printStackTrace();
        }
    }

    private void createTransaction(User user, Account account, Category category, String description, BigDecimal amount, TransactionType type, LocalDate date) {
        Transaction t = new Transaction();
        t.setUser(user);
        t.setAccount(account);
        t.setCategory(category);
        t.setDescription(description);
        t.setAmount(amount);
        t.setType(type);
        t.setDate(date);
        transactionRepository.save(t);
    }

    private void createCardTransaction(User user, CreditCard card, Category category, String description, BigDecimal amount, LocalDate date) {
        Transaction t = new Transaction();
        t.setUser(user);
        t.setCreditCard(card);
        t.setCategory(category);
        t.setDescription(description);
        t.setAmount(amount);
        t.setType(TransactionType.EXPENSE);
        t.setDate(date);
        transactionRepository.save(t);
    }
}
