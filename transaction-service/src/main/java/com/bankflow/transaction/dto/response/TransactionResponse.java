package com.bankflow.transaction.dto.response;
import com.bankflow.transaction.model.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private String transactionId;
    private String fromAccount;
    private String toAccount;
    private String userId;
    private TransactionType type;
    private BigDecimal amount;
    private String description;
    private TransactionStatus status;
    private TransactionMode transactionMode;
    private String referenceNumber;
    private LocalDateTime createdAt;
}
