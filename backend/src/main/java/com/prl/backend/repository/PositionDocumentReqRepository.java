package com.prl.backend.repository;

import com.prl.backend.entity.PositionDocumentReq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PositionDocumentReqRepository extends JpaRepository<PositionDocumentReq, Long> {

    List<PositionDocumentReq> findByJobPositionIdAndActiveTrue(Long jobPositionId);

    Optional<PositionDocumentReq> findByJobPositionIdAndDocumentTypeId(Long jobPositionId, Long documentTypeId);
}
