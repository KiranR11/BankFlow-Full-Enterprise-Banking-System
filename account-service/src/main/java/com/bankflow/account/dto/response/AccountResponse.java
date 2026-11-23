package com.bankflow.account.dto.response;

import com.bankflow.account.model.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {
    private Long id;
    private String accountNumber;
    private String userId;
    private AccountType accountType;
    private BigDecimal balance;
    private String currency;
    private AccountStatus status;
    private String ifscCode;
    private String branch;
    private String nominee;
    private LocalDateTime createdAt;
}
