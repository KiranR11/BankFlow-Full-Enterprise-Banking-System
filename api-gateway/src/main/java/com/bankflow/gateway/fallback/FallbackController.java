package com.bankflow.gateway.fallback;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;
@RestController
@RequestMapping("/fallback")
public class FallbackController {
    private ResponseEntity<Map<String,Object>> fallback(String service) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
            "success", false,
            "message", service + " is temporarily unavailable. Please try again.",
            "timestamp", LocalDateTime.now().toString()
        ));
    }
    @GetMapping("/user")   public ResponseEntity<Map<String,Object>> user()        { return fallback("User Service"); }
    @GetMapping("/account") public ResponseEntity<Map<String,Object>> account()   { return fallback("Account Service"); }
    @GetMapping("/transaction") public ResponseEntity<Map<String,Object>> txn()   { return fallback("Transaction Service"); }
    @GetMapping("/loan")   public ResponseEntity<Map<String,Object>> loan()        { return fallback("Loan Service"); }
}
