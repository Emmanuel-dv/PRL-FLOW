package com.prl.backend.repository;

import com.prl.backend.entity.EpiDelivery;
import com.prl.backend.entity.enums.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EpiDeliveryRepository extends JpaRepository<EpiDelivery, Long> {

    List<EpiDelivery> findByWorkerIdOrderByOpenedAtDesc(Long workerId);

    List<EpiDelivery> findByManagerIdOrderByOpenedAtDesc(Long managerId);

    List<EpiDelivery> findByCompanyIdOrderByOpenedAtDesc(Long companyId);

    List<EpiDelivery> findByWorkerIdAndStatus(Long workerId, DeliveryStatus status);

    List<EpiDelivery> findByCompanyIdAndStatus(Long companyId, DeliveryStatus status);
}
