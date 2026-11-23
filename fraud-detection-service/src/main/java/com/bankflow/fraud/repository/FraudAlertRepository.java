package com.bankflow.fraud.repository;
import com.bankflow.fraud.model.FraudAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface FraudAlertRepository extends JpaRepository<FraudAlert, Long> {
    List<FraudAlert> findByUserId(String userId);
    List<FraudAlert> findByStatus(String status);
    List<FraudAlert> findByUserIdAndStatus(String userId, String status);
}
