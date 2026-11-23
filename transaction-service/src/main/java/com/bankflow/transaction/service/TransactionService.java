package com.bankflow.transaction.service;
import com.bankflow.transaction.dto.request.*;
import com.bankflow.transaction.dto.response.*;
import com.bankflow.transaction.model.*;
import com.bankflow.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Slf4j
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private String generateTxnId() {
        return "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
    }

    @Transactional
    public ApiResponse<TransactionResponse> deposit(String userId, DepositRequest req) {
        String txnId = generateTxnId();
        Transaction txn = Transaction.builder()
            .transactionId(txnId).toAccount(req.getAccountNumber()).userId(userId)
            .type(TransactionType.DEPOSIT).amount(req.getAmount())
            .description(req.getDescription() != null ? req.getDescription() : "Deposit")
            .status(TransactionStatus.SUCCESS)
            .referenceNumber("REF-" + System.currentTimeMillis()).build();
        Transaction saved = transactionRepository.save(txn);
        kafkaTemplate.send("transaction.created", Map.of(
            "transactionId", txnId, "userId", userId,
            "accountNumber", req.getAccountNumber(), "type", "DEPOSIT",
            "amount", req.getAmount().toString(), "createdAt", LocalDateTime.now().toString()
        ));
        kafkaTemplate.send("fraud.check.request", Map.of(
            "transactionId", txnId, "userId", userId,
            "amount", req.getAmount().toString(), "type", "DEPOSIT"
        ));
        log.info("Deposit {} for {} amount {}", txnId, req.getAccountNumber(), req.getAmount());
        return ApiResponse.success(mapToResponse(saved), "Deposit successful. TxnId: " + txnId);
    }

    @Transactional
    public ApiResponse<TransactionResponse> withdraw(String userId, WithdrawalRequest req) {
        String txnId = generateTxnId();
        Transaction txn = Transaction.builder()
            .transactionId(txnId).fromAccount(req.getAccountNumber()).userId(userId)
            .type(TransactionType.WITHDRAWAL).amount(req.getAmount())
            .description(req.getDescription() != null ? req.getDescription() : "Withdrawal")
            .status(TransactionStatus.SUCCESS)
            .referenceNumber("REF-" + System.currentTimeMillis()).build();
        Transaction saved = transactionRepository.save(txn);
        kafkaTemplate.send("transaction.created", Map.of(
            "transactionId", txnId, "userId", userId,
            "accountNumber", req.getAccountNumber(), "type", "WITHDRAWAL",
            "amount", req.getAmount().toString(), "createdAt", LocalDateTime.now().toString()
        ));
        kafkaTemplate.send("fraud.check.request", Map.of(
            "transactionId", txnId, "userId", userId,
            "amount", req.getAmount().toString(), "type", "WITHDRAWAL"
        ));
        return ApiResponse.success(mapToResponse(saved), "Withdrawal successful. TxnId: " + txnId);
    }

    @Transactional
    public ApiResponse<TransactionResponse> transfer(String userId, TransferRequest req) {
        if (req.getFromAccount().equals(req.getToAccount()))
            throw new com.bankflow.transaction.exception.TransactionException("Cannot transfer to same account");
        String txnId = generateTxnId();
        Transaction txn = Transaction.builder()
            .transactionId(txnId).fromAccount(req.getFromAccount()).toAccount(req.getToAccount())
            .userId(userId).type(TransactionType.TRANSFER_DEBIT).amount(req.getAmount())
            .description(req.getDescription() != null ? req.getDescription() : "Fund Transfer")
            .status(TransactionStatus.SUCCESS)
            .transactionMode(TransactionMode.valueOf(req.getTransactionMode()))
            .referenceNumber("REF-" + System.currentTimeMillis()).build();
        Transaction saved = transactionRepository.save(txn);
        kafkaTemplate.send("transfer.initiated", Map.of(
            "transactionId", txnId, "userId", userId,
            "fromAccount", req.getFromAccount(), "toAccount", req.getToAccount(),
            "amount", req.getAmount().toString(), "mode", req.getTransactionMode(),
            "createdAt", LocalDateTime.now().toString()
        ));
        kafkaTemplate.send("fraud.check.request", Map.of(
            "transactionId", txnId, "userId", userId,
            "amount", req.getAmount().toString(), "type", "TRANSFER",
            "fromAccount", req.getFromAccount(), "toAccount", req.getToAccount()
        ));
        return ApiResponse.success(mapToResponse(saved), "Transfer initiated. TxnId: " + txnId);
    }

    public ApiResponse<Page<TransactionResponse>> getHistory(String userId, int page, int size) {
        Page<TransactionResponse> result = transactionRepository
            .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
            .map(this::mapToResponse);
        return ApiResponse.success(result, "History fetched");
    }

    public ApiResponse<List<TransactionResponse>> getAccountTransactions(String accountNumber) {
        return ApiResponse.success(
            transactionRepository.findByFromAccountOrToAccountOrderByCreatedAtDesc(accountNumber, accountNumber)
                .stream().map(this::mapToResponse).collect(Collectors.toList()),
            "Transactions fetched"
        );
    }

    private TransactionResponse mapToResponse(Transaction t) {
        return TransactionResponse.builder()
            .id(t.getId()).transactionId(t.getTransactionId())
            .fromAccount(t.getFromAccount()).toAccount(t.getToAccount())
            .userId(t.getUserId()).type(t.getType()).amount(t.getAmount())
            .description(t.getDescription()).status(t.getStatus())
            .transactionMode(t.getTransactionMode())
            .referenceNumber(t.getReferenceNumber()).createdAt(t.getCreatedAt()).build();
    }
}
