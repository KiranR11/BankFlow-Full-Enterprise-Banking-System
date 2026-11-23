package com.bankflow.account.exception;

public class AccountFrozenException extends RuntimeException {
    public AccountFrozenException(String m) {
        super(m);
    }
}
