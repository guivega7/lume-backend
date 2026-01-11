package com.example.projetofinanceiro.scheduler;

import com.example.projetofinanceiro.model.Subscription;
import com.example.projetofinanceiro.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SubscriptionScheduler {

    private final SubscriptionRepository subscriptionRepository;

    @Scheduled(cron = "0 0 9 * * *")
    public void checkUpcomingSubscriptions() {
        LocalDate targetDate = LocalDate.now().plusDays(2);
        List<Subscription> expiringSubscriptions = subscriptionRepository.findByNextPaymentDate(targetDate);

        for (Subscription sub : expiringSubscriptions) {
            System.out.println("Alerta: A assinatura " + sub.getName() + " do usuário " + sub.getUser().getId() + " vence dia " + targetDate);
        }
    }
}
