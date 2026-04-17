package com.prl.backend.repository;

import com.prl.backend.entity.EpiDeliveryConfirm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EpiDeliveryConfirmRepository extends JpaRepository<EpiDeliveryConfirm, Long> {

    Optional<EpiDeliveryConfirm> findByEpiDeliveryId(Long deliveryId);
}
