package com.bankflow.account.controller;

import com.bankflow.account.dto.request.CreateAccountRequest;
import com.bankflow.account.dto.response.*;
import com.bankflow.account.service.AccountService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Tag(name = "Account Management")
public class AccountController {
    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<ApiResponse<AccountResponse>> createAccount(
        @AuthenticationPrincipal UserDetails ud,
        @Valid @RequestBody CreateAccountRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(accountService.createAccount(ud.getUsername(), req));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getMyAccounts(
        @AuthenticationPrincipal UserDetails ud
    ) {
        return ResponseEntity.ok(accountService.getMyAccounts(ud.getUsername()));
    }

    @GetMapping("/{accountNumber}")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccount(
        @PathVariable String accountNumber
    ) {
        return ResponseEntity.ok(accountService.getAccountByNumber(accountNumber));
    }

    @GetMapping("/{accountNumber}/balance")
    public ResponseEntity<ApiResponse<BigDecimal>> getBalance(
        @PathVariable String accountNumber,
        @AuthenticationPrincipal UserDetails ud
    ) {
        return ResponseEntity.ok(accountService.getBalance(accountNumber, ud.getUsername()));
    }

    @PutMapping("/{accountNumber}/freeze")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> freeze(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.freezeAccount(accountNumber));
    }

    @PutMapping("/{accountNumber}/unfreeze")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> unfreeze(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.unfreezeAccount(accountNumber));
    }
}
