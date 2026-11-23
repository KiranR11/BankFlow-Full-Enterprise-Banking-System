package com.bankflow.transaction.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
@Data
public class WithdrawalRequest {
    @NotBlank private String accountNumber;
    @NotNull @DecimalMin("1.00") private BigDecimal amount;
    private String description;
}
