package com.bankflow.transaction.model;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity @Table(name="transactions") @Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Transaction {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false,unique=true) private String transactionId;
    private String fromAccount;
    private String toAccount;
    @Column(nullable=false) private String userId;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private TransactionType type;
    @Column(nullable=false,precision=15,scale=2) private BigDecimal amount;
    private String description;
    @Enumerated(EnumType.STRING) @Column(nullable=false) @Builder.Default private TransactionStatus status = TransactionStatus.SUCCESS;
    @Enumerated(EnumType.STRING) private TransactionMode transactionMode;
    private String referenceNumber;
    @Column(nullable=false) private LocalDateTime createdAt;
    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }
}
