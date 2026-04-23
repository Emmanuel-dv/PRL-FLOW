package com.prl.backend.repository;

import com.prl.backend.entity.IncidentStatusLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentStatusLogRepository extends JpaRepository<IncidentStatusLog, Long> {

    List<IncidentStatusLog> findByIncident_IdOrderByChangedAtAsc(Long incidentId);
}
