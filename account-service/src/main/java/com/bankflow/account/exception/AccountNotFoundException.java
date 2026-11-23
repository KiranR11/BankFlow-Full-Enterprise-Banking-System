package com.bankflow.account.exception;

public class AccountNotFoundException extends RuntimeException {
    public AccountNotFoundException(String m) {
        super(m);
    }
}
