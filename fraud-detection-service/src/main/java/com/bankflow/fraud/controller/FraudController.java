package com.bankflow.fraud.controller;
import com.bankflow.fraud.model.FraudAlert;
import com.bankflow.fraud.service.FraudDetectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/fraud")
@RequiredArgsConstructor
public class FraudController {
    private final FraudDetectionService fraudDetectionService;

    @GetMapping("/alerts")
    public ResponseEntity<List<FraudAlert>> getAllAlerts() {
        return ResponseEntity.ok(fraudDetectionService.getAllAlerts());
    }

    @GetMapping("/alerts/open")
    public ResponseEntity<List<FraudAlert>> getOpenAlerts() {
        return ResponseEntity.ok(fraudDetectionService.getOpenAlerts());
    }

    @GetMapping("/alerts/user/{userId}")
    public ResponseEntity<List<FraudAlert>> getUserAlerts(@PathVariable String userId) {
        return ResponseEntity.ok(fraudDetectionService.getUserAlerts(userId));
    }

    @PutMapping("/alerts/{id}/resolve")
    public ResponseEntity<Void> resolveAlert(@PathVariable Long id) {
        fraudDetectionService.resolveAlert(id);
        return ResponseEntity.ok().build();
    }
}
