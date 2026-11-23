package com.bankflow.fraud.service;
import com.bankflow.fraud.model.FraudAlert;
import com.bankflow.fraud.repository.FraudAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.*;

@Service @RequiredArgsConstructor @Slf4j
public class FraudDetectionService {
    private final FraudAlertRepository alertRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${fraud.rules.max-single-transaction:500000}") private long maxSingleTransaction;
    @Value("${fraud.rules.high-risk-amount-threshold:100000}") private long highRiskThreshold;

    public void analyzeTransaction(Map<String, Object> txnData) {
        String userId = (String) txnData.get("userId");
        String txnId  = (String) txnData.get("transactionId");
        String type   = (String) txnData.get("type");
        BigDecimal amount = new BigDecimal(txnData.get("amount").toString());

        int riskScore = 0;
        List<String> riskReasons = new ArrayList<>();

        // Rule 1: Large transaction check
        if (amount.compareTo(BigDecimal.valueOf(maxSingleTransaction)) > 0) {
            riskScore += 40;
            riskReasons.add("Amount exceeds single transaction limit: " + amount);
        }

        // Rule 2: High-risk amount
        if (amount.compareTo(BigDecimal.valueOf(highRiskThreshold)) > 0) {
            riskScore += 20;
            riskReasons.add("High-risk amount: " + amount);
        }

        // Rule 3: Multiple rapid withdrawals (simulated)
        if ("WITHDRAWAL".equals(type) || "TRANSFER".equals(type)) {
            riskScore += 10;
        }

        // Rule 4: Round number detection (potential structuring)
        if (amount.remainder(BigDecimal.valueOf(10000)).compareTo(BigDecimal.ZERO) == 0
                && amount.compareTo(BigDecimal.valueOf(10000)) >= 0) {
            riskScore += 5;
            riskReasons.add("Round number amount (potential structuring)");
        }

        log.info("Fraud check for {} ({}): riskScore={}", txnId, type, riskScore);

        if (riskScore >= 30) {
            String alertId = "ALT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            String description = String.join("; ", riskReasons);
            String accountNumber = (String) txnData.getOrDefault("accountNumber",
                txnData.getOrDefault("fromAccount", "UNKNOWN"));

            FraudAlert alert = FraudAlert.builder()
                .alertId(alertId).userId(userId).accountNumber(accountNumber)
                .transactionId(txnId).alertType(riskScore >= 60 ? "HIGH_RISK" : "MEDIUM_RISK")
                .description(description).riskScore(riskScore).status("OPEN").build();

            alertRepository.save(alert);

            kafkaTemplate.send("fraud.alert", Map.of(
                "alertId", alertId, "userId", userId, "transactionId", txnId,
                "riskScore", riskScore, "alertType", alert.getAlertType(),
                "description", description
            ));

            log.warn("🚨 FRAUD ALERT created: {} for txn {} (score={})", alertId, txnId, riskScore);
        }
    }

    public List<FraudAlert> getAllAlerts() { return alertRepository.findAll(); }
    public List<FraudAlert> getOpenAlerts() { return alertRepository.findByStatus("OPEN"); }
    public List<FraudAlert> getUserAlerts(String userId) { return alertRepository.findByUserId(userId); }

    public void resolveAlert(Long id) {
        alertRepository.findById(id).ifPresent(a -> {
            a.setStatus("RESOLVED");
            a.setResolvedAt(java.time.LocalDateTime.now());
            alertRepository.save(a);
        });
    }
}
