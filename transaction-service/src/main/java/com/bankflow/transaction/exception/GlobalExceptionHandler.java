package com.bankflow.transaction.exception;
import com.bankflow.transaction.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
@RestControllerAdvice @Slf4j
public class GlobalExceptionHandler {
    @ExceptionHandler(TransactionException.class)
    public ResponseEntity<ApiResponse<Void>> txnError(TransactionException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> general(Exception e) {
        log.error("Error: {}", e.getMessage(), e);
        return ResponseEntity.status(500).body(ApiResponse.error("Internal server error"));
    }
}
