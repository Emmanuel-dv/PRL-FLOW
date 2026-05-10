package com.prl.backend.repository;

import com.prl.backend.entity.PositionDocumentReq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PositionDocumentReqRepository extends JpaRepository<PositionDocumentReq, Long> {

    List<PositionDocumentReq> findByJobPositionIdAndActiveTrue(Long jobPositionId);

    @Query("SELECT p FROM PositionDocumentReq p " +
            "LEFT JOIN FETCH p.documentType " +
            "LEFT JOIN FETCH p.jobPosition " +
            "WHERE p.jobPosition.id = :jobPositionId AND p.active = true")
    List<PositionDocumentReq> findByJobPositionIdWithRelations(@Param("jobPositionId") Long jobPositionId);

    Optional<PositionDocumentReq> findByJobPositionIdAndDocumentTypeId(Long jobPositionId, Long documentTypeId);
}
