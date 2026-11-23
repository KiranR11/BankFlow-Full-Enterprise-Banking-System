package com.bankflow.fraud.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity @Table(name = "fraud_alerts") @Data @Builder @NoArgsConstructor @AllArgsConstructor
public class FraudAlert {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true) private String alertId;
    @Column(nullable = false) private String userId;
    private String accountNumber;
    private String transactionId;
    @Column(nullable = false) private String alertType;
    @Column(columnDefinition = "TEXT") private String description;
    private Integer riskScore;
    @Column(nullable = false) @Builder.Default private String status = "OPEN";
    @Column(nullable = false) private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }
}
