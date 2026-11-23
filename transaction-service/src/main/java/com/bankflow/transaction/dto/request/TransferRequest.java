package com.bankflow.transaction.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
@Data
public class TransferRequest {
    @NotBlank private String fromAccount;
    @NotBlank private String toAccount;
    @NotNull @DecimalMin("1.00") private BigDecimal amount;
    private String description;
    @NotBlank private String transactionMode;
}
