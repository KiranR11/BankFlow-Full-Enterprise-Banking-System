package com.bankflow.transaction.controller;
import com.bankflow.transaction.dto.request.*;
import com.bankflow.transaction.dto.response.*;
import com.bankflow.transaction.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;

    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<TransactionResponse>> deposit(@AuthenticationPrincipal UserDetails ud, @Valid @RequestBody DepositRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.deposit(ud.getUsername(), req));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<TransactionResponse>> withdraw(@AuthenticationPrincipal UserDetails ud, @Valid @RequestBody WithdrawalRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.withdraw(ud.getUsername(), req));
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<TransactionResponse>> transfer(@AuthenticationPrincipal UserDetails ud, @Valid @RequestBody TransferRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.transfer(ud.getUsername(), req));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getHistory(
        @AuthenticationPrincipal UserDetails ud,
        @RequestParam(defaultValue="0") int page,
        @RequestParam(defaultValue="20") int size) {
        return ResponseEntity.ok(transactionService.getHistory(ud.getUsername(), page, size));
    }

    @GetMapping("/account/{accountNumber}")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getByAccount(@PathVariable String accountNumber) {
        return ResponseEntity.ok(transactionService.getAccountTransactions(accountNumber));
    }
}
