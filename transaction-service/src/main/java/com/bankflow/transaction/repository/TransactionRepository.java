package com.bankflow.transaction.repository;
import com.bankflow.transaction.model.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    List<Transaction> findByFromAccountOrToAccountOrderByCreatedAtDesc(String from, String to);
}
