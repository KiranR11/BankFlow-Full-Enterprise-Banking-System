package com.bankflow.account.dto.request;

import com.bankflow.account.model.AccountType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateAccountRequest {
    @NotNull(message = "Account type is required")
    private AccountType accountType;

    private String nominee;

    private String branch;
}
