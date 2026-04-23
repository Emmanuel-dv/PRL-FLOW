package com.prl.backend.repository;

import com.prl.backend.entity.WorkerDocument;
import com.prl.backend.entity.enums.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WorkerDocumentRepository extends JpaRepository<WorkerDocument, Long> {

    List<WorkerDocument> findByWorkerId(Long workerId);

    List<WorkerDocument> findByWorkerIdAndStatus(Long workerId, DocumentStatus status);

    List<WorkerDocument> findByWorkerCompanyId(Long companyId);

    List<WorkerDocument> findByWorkerCompanyIdAndStatus(Long companyId, DocumentStatus status);

    @Query("SELECT wd FROM WorkerDocument wd WHERE wd.status = 'APPROVED' " +
            "AND wd.expiryDate IS NOT NULL " +
            "AND wd.expiryDate BETWEEN :today AND :limitDate")
    List<WorkerDocument> findExpiringSoon(
            @Param("today") LocalDate today,
            @Param("limitDate") LocalDate limitDate);

    @Query("SELECT wd FROM WorkerDocument wd WHERE wd.status = 'APPROVED' " +
            "AND wd.expiryDate IS NOT NULL " +
            "AND wd.expiryDate < :today")
    List<WorkerDocument> findExpired(@Param("today") LocalDate today);

    long countByWorkerCompanyIdAndStatus(Long companyId, DocumentStatus status);

    long countByWorkerCompanyId(Long companyId);
}
