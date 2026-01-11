package com.example.projetofinanceiro.service;

import ai.pluggy.client.PluggyClient;
import ai.pluggy.client.request.CreateConnectTokenRequest;
import ai.pluggy.client.request.TransactionsSearchRequest;
import ai.pluggy.client.response.ConnectTokenResponse;
import ai.pluggy.client.response.TransactionsResponse;
import com.example.projetofinanceiro.model.Transaction;
import com.example.projetofinanceiro.model.TransactionType;
import com.example.projetofinanceiro.model.User;
import com.example.projetofinanceiro.repository.TransactionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import retrofit2.Response;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;

@Slf4j
@Service
public class PluggyIntegrationService {

    private final PluggyClient pluggyClient;
    private final TransactionRepository transactionRepository;

    public PluggyIntegrationService(
            @Value("${pluggy.client.id:}") String clientId,
            @Value("${pluggy.client.secret:}") String clientSecret,
            TransactionRepository transactionRepository) {
        
        this.transactionRepository = transactionRepository;
        
        if (clientId != null && !clientId.isEmpty() && clientSecret != null && !clientSecret.isEmpty()) {
            this.pluggyClient = PluggyClient.builder()
                    .clientIdAndSecret(clientId, clientSecret)
                    .build();
        } else {
            this.pluggyClient = null;
            log.warn("Pluggy credentials not found. Integration disabled.");
        }
    }

    public String criarConnectToken() {
        if (pluggyClient == null) {
            throw new RuntimeException("Pluggy client is not initialized.");
        }
        try {
            // Na versão 0.10.0, o método pode exigir um objeto de request vazio ou nulo, 
            // mas CreateConnectTokenRequest é o padrão.
            Response<ConnectTokenResponse> response = pluggyClient.service()
                .createConnectToken(new CreateConnectTokenRequest())
                .execute();
            
            if (response.isSuccessful() && response.body() != null) {
                return response.body().getAccessToken();
            } else {
                throw new RuntimeException("Falha ao criar Connect Token: " + response.message());
            }
        } catch (IOException e) {
            throw new RuntimeException("Erro de IO ao criar Connect Token da Pluggy", e);
        }
    }

    public void sincronizarTransacoes(String accountId, User user) {
        if (pluggyClient == null) {
            log.error("Pluggy client is not initialized.");
            return;
        }

        try {
            // Busca transações dos últimos 30 dias
            TransactionsSearchRequest request = new TransactionsSearchRequest()
                    .accountId(accountId)
                    .from(LocalDate.now().minusDays(30).toString());

            Response<TransactionsResponse> response = pluggyClient.service()
                .transactions()
                .list(request)
                .execute();

            if (response.isSuccessful() && response.body() != null && response.body().getResults() != null) {
                int count = 0;
                for (ai.pluggy.client.response.Transaction pluggyTx : response.body().getResults()) {
                    if (saveTransaction(pluggyTx, user)) {
                        count++;
                    }
                }
                log.info("Sincronização concluída. {} novas transações salvas para o usuário {}.", count, user.getEmail());
            } else {
                log.error("Falha ao buscar transações da Pluggy. Código: {}, Mensagem: {}", response.code(), response.message());
            }

        } catch (IOException e) {
            log.error("Erro de conexão com a API da Pluggy: ", e);
        } catch (Exception e) {
            log.error("Erro inesperado durante a sincronização: ", e);
        }
    }

    private boolean saveTransaction(ai.pluggy.client.response.Transaction pluggyTx, User user) {
        try {
            // Verifica duplicidade pelo ID externo
            if (transactionRepository.existsByExternalId(pluggyTx.getId())) {
                return false; // Já existe, ignora
            }

            Transaction transaction = new Transaction();
            transaction.setExternalId(pluggyTx.getId());
            transaction.setDescription(pluggyTx.getDescription());
            transaction.setUser(user);
            
            // Mapeamento de valor e tipo
            // Na versão 0.10.0, getAmount() retorna Double.
            BigDecimal amount = BigDecimal.valueOf(pluggyTx.getAmount());
            
            if (amount.compareTo(BigDecimal.ZERO) < 0) {
                transaction.setType(TransactionType.EXPENSE);
                transaction.setAmount(amount.abs());
            } else {
                transaction.setType(TransactionType.INCOME);
                transaction.setAmount(amount);
            }

            // Data
            if (pluggyTx.getDate() != null) {
                try {
                    // Tenta parsear a data (formato ISO 8601 esperado)
                    transaction.setDate(LocalDate.parse(pluggyTx.getDate().substring(0, 10)));
                } catch (Exception e) {
                    log.warn("Erro ao parsear data da transação {}: {}. Usando data atual.", pluggyTx.getId(), pluggyTx.getDate());
                    transaction.setDate(LocalDate.now());
                }
            } else {
                transaction.setDate(LocalDate.now());
            }

            transactionRepository.save(transaction);
            return true;

        } catch (Exception e) {
            log.error("Erro ao converter/salvar transação {}: ", pluggyTx.getId(), e);
            return false;
        }
    }
}
