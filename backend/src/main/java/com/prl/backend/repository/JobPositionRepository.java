package com.prl.backend.repository;

import com.prl.backend.entity.JobPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobPositionRepository extends JpaRepository<JobPosition, Long> {

    List<JobPosition> findByCompanyIdAndActiveTrue(Long companyId);

    boolean existsByNameAndCompanyId(String name, Long companyId);
}
