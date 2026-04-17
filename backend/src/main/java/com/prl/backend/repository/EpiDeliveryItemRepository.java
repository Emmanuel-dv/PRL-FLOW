package com.prl.backend.repository;

import com.prl.backend.entity.EpiDeliveryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EpiDeliveryItemRepository extends JpaRepository<EpiDeliveryItem, Long> {

    List<EpiDeliveryItem> findByEpiDeliveryId(Long deliveryId);
}
