package com.bankflow.transaction.exception;

public class InsufficientFundsException extends RuntimeException {
    public InsufficientFundsException(String m) {
        super(m);
    }
}
