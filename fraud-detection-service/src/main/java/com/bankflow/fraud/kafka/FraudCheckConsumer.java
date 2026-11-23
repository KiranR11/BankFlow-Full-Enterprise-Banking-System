package com.bankflow.fraud.kafka;
import com.bankflow.fraud.service.FraudDetectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import java.util.Map;
@Service @RequiredArgsConstructor @Slf4j
public class FraudCheckConsumer {
    private final FraudDetectionService fraudDetectionService;

    @KafkaListener(topics = "fraud.check.request", groupId = "fraud-service-group")
    public void handleFraudCheck(Map<String, Object> txnData) {
        log.info("Received fraud check request: {}", txnData.get("transactionId"));
        fraudDetectionService.analyzeTransaction(txnData);
    }
}
