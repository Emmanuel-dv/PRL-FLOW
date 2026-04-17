package com.prl.backend.repository;

import com.prl.backend.entity.PositionEpiReq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PositionEpiReqRepository extends JpaRepository<PositionEpiReq, Long> {

    List<PositionEpiReq> findByJobPositionIdAndActiveTrue(Long jobPositionId);

    Optional<PositionEpiReq> findByJobPositionIdAndEpiCatalogId(Long jobPositionId, Long epiCatalogId);
}
