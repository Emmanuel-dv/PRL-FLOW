package com.prl.backend.repository;

import com.prl.backend.entity.PositionEpiReq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PositionEpiReqRepository extends JpaRepository<PositionEpiReq, Long> {

    List<PositionEpiReq> findByJobPositionIdAndActiveTrue(Long jobPositionId);

    @Query("SELECT p FROM PositionEpiReq p " +
            "LEFT JOIN FETCH p.epiCatalog " +
            "LEFT JOIN FETCH p.jobPosition " +
            "WHERE p.jobPosition.id = :jobPositionId AND p.active = true")
    List<PositionEpiReq> findByJobPositionIdWithRelations(@Param("jobPositionId") Long jobPositionId);

    Optional<PositionEpiReq> findByJobPositionIdAndEpiCatalogId(Long jobPositionId, Long epiCatalogId);
}
