package com.bankflow.account.exception;

public class InsufficientFundsException extends RuntimeException {
    public InsufficientFundsException(String m) {
        super(m);
    }
}
