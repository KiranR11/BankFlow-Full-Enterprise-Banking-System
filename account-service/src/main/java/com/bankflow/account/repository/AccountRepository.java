package com.bankflow.account.repository;

import com.bankflow.account.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByAccountNumber(String accountNumber);

    List<Account> findByUserId(String userId);

    List<Account> findByUserIdAndStatus(String userId, AccountStatus status);

    boolean existsByAccountNumber(String accountNumber);

    long countByUserId(String userId);
}
