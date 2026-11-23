# BankFlow — Full Enterprise Banking System

A production-grade **microservices banking system** built with Java 17, Spring Boot 3.2, React 18, Apache Kafka, Redis, PostgreSQL, Docker, and Jenkins CI/CD.

## 🏗️ Architecture

```
React Frontend (:3000)
       │
  API Gateway (:8080) — JWT Validation, Rate Limiting, CORS
       │
  ┌────┴─────────────────────────────────────────────────┐
  │            │            │            │                 │
User(:8081) Account(:8082) Txn(:8083) Loan(:8084)  Fraud(:8086)
  │                │             │
  └────────────────┴─────────────┴──► Apache Kafka
                                           │
                                   Notification(:8085)
  
  ┌────────────────────────────────────────────────────────┐
  │  Redis (Cache + JWT Blacklist + Rate Limiting + OTP)   │
  │  PostgreSQL × 5 (users_db, accounts_db, txn_db,       │
  │                   loans_db, fraud_db)                   │
  └────────────────────────────────────────────────────────┘
```

## 🚀 Services

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 8080 | Routes, JWT validation, rate limiting |
| User Service | 8081 | Register, login, JWT, profile, KYC |
| Account Service | 8082 | Savings/Current accounts, balance, statements |
| Transaction Service | 8083 | Deposit, Withdraw, Fund Transfers |
| Loan Service | 8084 | Apply, approve, EMI, repayment |
| Notification Service | 8085 | Email/SMS alerts via Kafka |
| Fraud Detection | 8086 | Rule-based fraud, velocity checks |
| React Frontend | 3000 | Full banking dashboard |

## 🛠️ Tech Stack

- **Language:** Java 17 | **Framework:** Spring Boot 3.2 | **Security:** Spring Security 6 + JWT
- **Frontend:** React 18 + Vite + React Router v6 + Axios
- **Messaging:** Apache Kafka (event-driven async communication)
- **Cache:** Redis (JWT blacklist, balance cache, OTP, rate limiting)
- **Database:** PostgreSQL × 5 databases
- **Containerization:** Docker + Docker Compose
- **CI/CD:** Jenkins | **API Docs:** Swagger/OpenAPI

## ⚡ Quick Start

```bash
docker-compose up --build
```

Frontend: http://localhost:3000  |  API: http://localhost:8080

## 👤 Default Roles

| Role | Access |
|------|--------|
| CUSTOMER | Own accounts, own transactions, loan applications |
| ADMIN | All accounts, all transactions, approve loans, manage users |