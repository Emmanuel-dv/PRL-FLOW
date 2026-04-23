package com.prl.backend.repository;

import com.prl.backend.entity.Incident;
import com.prl.backend.entity.enums.IncidentSeverity;
import com.prl.backend.entity.enums.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    List<Incident> findByCompany_IdOrderByCreatedAtDesc(Long companyId);

    List<Incident> findByReportedBy_IdOrderByCreatedAtDesc(Long userId);

    List<Incident> findByAssignedTo_IdOrderByCreatedAtDesc(Long userId);

    List<Incident> findByCompany_IdAndStatus(Long companyId, IncidentStatus status);

    List<Incident> findByCompany_IdAndSeverity(Long companyId, IncidentSeverity severity);

    long countByCompany_IdAndStatus(Long companyId, IncidentStatus status);
}
