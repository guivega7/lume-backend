package com.example.projetofinanceiro.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long BLOCK_DURATION_MS = TimeUnit.MINUTES.toMillis(15); // 15 minutos de bloqueio

    // Armazena IP -> {tentativas, timestamp_bloqueio}
    // Simplificação: Usando Map. Em produção, use Redis ou Caffeine Cache.
    private final Map<String, Integer> attemptsCache = new ConcurrentHashMap<>();
    private final Map<String, Long> blockCache = new ConcurrentHashMap<>();

    public void loginSucceeded(String key) {
        attemptsCache.remove(key);
        blockCache.remove(key);
    }

    public void loginFailed(String key) {
        int attempts = attemptsCache.getOrDefault(key, 0);
        attempts++;
        attemptsCache.put(key, attempts);
        
        if (attempts >= MAX_ATTEMPTS) {
            blockCache.put(key, System.currentTimeMillis() + BLOCK_DURATION_MS);
        }
    }

    public boolean isBlocked(String key) {
        if (blockCache.containsKey(key)) {
            Long unblockTime = blockCache.get(key);
            if (System.currentTimeMillis() < unblockTime) {
                return true;
            } else {
                // Bloqueio expirou
                blockCache.remove(key);
                attemptsCache.remove(key);
                return false;
            }
        }
        return false;
    }
}
