-- ═══════════════════════════════════════════════
-- BankFlow — Database Initialization Script
-- ═══════════════════════════════════════════════

-- Create databases
CREATE DATABASE users_db;
CREATE DATABASE accounts_db;
CREATE DATABASE transactions_db;
CREATE DATABASE loans_db;
CREATE DATABASE fraud_db;

-- ─── users_db ───────────────────────────────────
\c users_db;

CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL PRIMARY KEY,
    user_id         VARCHAR(20)    NOT NULL UNIQUE,
    full_name       VARCHAR(255)   NOT NULL,
    email           VARCHAR(255)   NOT NULL UNIQUE,
    phone           VARCHAR(15)    NOT NULL UNIQUE,
    password        VARCHAR(255)   NOT NULL,
    role            VARCHAR(20)    NOT NULL DEFAULT 'CUSTOMER',
    status          VARCHAR(20)    NOT NULL DEFAULT 'ACTIVE',
    kyc_status      VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    date_of_birth   DATE,
    address         TEXT,
    created_at      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP
);

CREATE INDEX idx_users_email   ON users(email);
CREATE INDEX idx_users_phone   ON users(phone);
CREATE INDEX idx_users_user_id ON users(user_id);

-- Seed admin user (password = Admin@123 BCrypt-hashed)
INSERT INTO users (user_id, full_name, email, phone, password, role, status, kyc_status)
VALUES ('USR-00001', 'System Admin', 'admin@bankflow.com', '9999999999',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh3y', 'ADMIN', 'ACTIVE', 'VERIFIED');

-- ─── accounts_db ────────────────────────────────
\c accounts_db;

CREATE TABLE IF NOT EXISTS accounts (
    id              BIGSERIAL PRIMARY KEY,
    account_number  VARCHAR(16)    NOT NULL UNIQUE,
    user_id         VARCHAR(20)    NOT NULL,
    account_type    VARCHAR(20)    NOT NULL,
    balance         DECIMAL(15,2)  NOT NULL DEFAULT 0.00,
    currency        VARCHAR(3)     NOT NULL DEFAULT 'INR',
    status          VARCHAR(20)    NOT NULL DEFAULT 'ACTIVE',
    ifsc_code       VARCHAR(11)    NOT NULL DEFAULT 'BNKF0001234',
    branch          VARCHAR(100)   DEFAULT 'Main Branch',
    created_at      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP
);

CREATE INDEX idx_accounts_user_id  ON accounts(user_id);
CREATE INDEX idx_accounts_number   ON accounts(account_number);
CREATE INDEX idx_accounts_status   ON accounts(status);

-- Seed account for admin
INSERT INTO accounts (account_number, user_id, account_type, balance)
VALUES ('1000000000000001', 'USR-00001', 'SAVINGS', 100000.00);

-- ─── transactions_db ────────────────────────────
\c transactions_db;

CREATE TABLE IF NOT EXISTS transactions (
    id                  BIGSERIAL PRIMARY KEY,
    transaction_id      VARCHAR(20)    NOT NULL UNIQUE,
    from_account        VARCHAR(16),
    to_account          VARCHAR(16),
    user_id             VARCHAR(20)    NOT NULL,
    type                VARCHAR(20)    NOT NULL,
    amount              DECIMAL(15,2)  NOT NULL,
    balance_after       DECIMAL(15,2),
    description         VARCHAR(255),
    status              VARCHAR(20)    NOT NULL DEFAULT 'SUCCESS',
    reference_number    VARCHAR(50),
    transaction_mode    VARCHAR(20),
    created_at          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_txn_user_id      ON transactions(user_id);
CREATE INDEX idx_txn_from_account ON transactions(from_account);
CREATE INDEX idx_txn_to_account   ON transactions(to_account);
CREATE INDEX idx_txn_created_at   ON transactions(created_at);
CREATE INDEX idx_txn_type         ON transactions(type);

-- ─── loans_db ───────────────────────────────────
\c loans_db;

CREATE TABLE IF NOT EXISTS loans (
    id              BIGSERIAL PRIMARY KEY,
    loan_id         VARCHAR(20)    NOT NULL UNIQUE,
    user_id         VARCHAR(20)    NOT NULL,
    account_number  VARCHAR(16)    NOT NULL,
    loan_type       VARCHAR(30)    NOT NULL,
    amount          DECIMAL(15,2)  NOT NULL,
    interest_rate   DECIMAL(5,2)   NOT NULL,
    tenure_months   INTEGER        NOT NULL,
    emi_amount      DECIMAL(15,2),
    total_amount    DECIMAL(15,2),
    paid_amount     DECIMAL(15,2)  DEFAULT 0.00,
    status          VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    purpose         TEXT,
    applied_at      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at     TIMESTAMP,
    disbursed_at    TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emi_schedule (
    id              BIGSERIAL PRIMARY KEY,
    loan_id         VARCHAR(20)    NOT NULL,
    emi_number      INTEGER        NOT NULL,
    due_date        DATE           NOT NULL,
    emi_amount      DECIMAL(15,2)  NOT NULL,
    principal       DECIMAL(15,2),
    interest        DECIMAL(15,2),
    paid_at         TIMESTAMP,
    status          VARCHAR(20)    NOT NULL DEFAULT 'PENDING'
);

CREATE INDEX idx_loans_user_id  ON loans(user_id);
CREATE INDEX idx_loans_status   ON loans(status);
CREATE INDEX idx_emi_loan_id    ON emi_schedule(loan_id);

-- ─── fraud_db ───────────────────────────────────
\c fraud_db;

CREATE TABLE IF NOT EXISTS fraud_alerts (
    id                  BIGSERIAL PRIMARY KEY,
    alert_id            VARCHAR(20)    NOT NULL UNIQUE,
    user_id             VARCHAR(20)    NOT NULL,
    account_number      VARCHAR(16),
    transaction_id      VARCHAR(20),
    alert_type          VARCHAR(50)    NOT NULL,
    description         TEXT,
    risk_score          INTEGER,
    status              VARCHAR(20)    NOT NULL DEFAULT 'OPEN',
    created_at          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at         TIMESTAMP
);

CREATE INDEX idx_fraud_user_id  ON fraud_alerts(user_id);
CREATE INDEX idx_fraud_status   ON fraud_alerts(status);