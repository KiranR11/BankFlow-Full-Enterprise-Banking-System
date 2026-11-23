package com.bankflow.account.service;

import com.bankflow.account.dto.request.CreateAccountRequest;
import com.bankflow.account.dto.response.*;
import com.bankflow.account.exception.*;
import com.bankflow.account.model.*;
import com.bankflow.account.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountService {
    private final AccountRepository accountRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public ApiResponse<AccountResponse> createAccount(String userId, CreateAccountRequest req) {
        String accountNumber = generateAccountNumber();
        Account account = Account.builder()
            .accountNumber(accountNumber)
            .userId(userId)
            .accountType(req.getAccountType())
            .balance(BigDecimal.ZERO)
            .currency("INR")
            .status(AccountStatus.ACTIVE)
            .ifscCode("BNKF0001234")
            .branch(req.getBranch() != null ? req.getBranch() : "Main Branch")
            .nominee(req.getNominee())
            .build();

        Account saved = accountRepository.save(account);
        kafkaTemplate.send("account.created", Map.of(
            "accountNumber", saved.getAccountNumber(),
            "userId", userId,
            "accountType", req.getAccountType().name(),
            "createdAt", LocalDateTime.now().toString()
        ));
        log.info("Account created: {} for user: {}", accountNumber, userId);
        return ApiResponse.success(mapToResponse(saved), "Account created successfully");
    }

    public ApiResponse<List<AccountResponse>> getMyAccounts(String userId) {
        List<AccountResponse> accounts = accountRepository.findByUserId(userId)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
        return ApiResponse.success(accounts, "Accounts fetched");
    }

    public ApiResponse<AccountResponse> getAccountByNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
            .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountNumber));
        return ApiResponse.success(mapToResponse(account), "Account fetched");
    }

    public ApiResponse<BigDecimal> getBalance(String accountNumber, String userId) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
            .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountNumber));
        return ApiResponse.success(account.getBalance(), "Balance fetched");
    }

    @Transactional
    public void debit(String accountNumber, BigDecimal amount) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
            .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountNumber));
        if (account.getStatus() == AccountStatus.FROZEN)
            throw new AccountFrozenException("Account is frozen: " + accountNumber);
        if (account.getBalance().compareTo(amount) < 0)
            throw new InsufficientFundsException("Insufficient funds. Available: " + account.getBalance());
        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);
    }

    @Transactional
    public void credit(String accountNumber, BigDecimal amount) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
            .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountNumber));
        if (account.getStatus() == AccountStatus.FROZEN)
            throw new AccountFrozenException("Account is frozen: " + accountNumber);
        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);
    }

    public ApiResponse<Void> freezeAccount(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
            .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountNumber));
        account.setStatus(AccountStatus.FROZEN);
        accountRepository.save(account);
        return ApiResponse.success(null, "Account frozen");
    }

    public ApiResponse<Void> unfreezeAccount(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
            .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountNumber));
        account.setStatus(AccountStatus.ACTIVE);
        accountRepository.save(account);
        return ApiResponse.success(null, "Account unfrozen");
    }

    private String generateAccountNumber() {
        SecureRandom rng = new SecureRandom();
        String num;
        do {
            num = String.format("%016d", Math.abs(rng.nextLong() % 10000000000000000L));
        } while (accountRepository.existsByAccountNumber(num));
        return num;
    }

    private AccountResponse mapToResponse(Account a) {
        return AccountResponse.builder()
            .id(a.getId())
            .accountNumber(a.getAccountNumber())
            .userId(a.getUserId())
            .accountType(a.getAccountType())
            .balance(a.getBalance())
            .currency(a.getCurrency())
            .status(a.getStatus())
            .ifscCode(a.getIfscCode())
            .branch(a.getBranch())
            .nominee(a.getNominee())
            .createdAt(a.getCreatedAt())
            .build();
    }
}
