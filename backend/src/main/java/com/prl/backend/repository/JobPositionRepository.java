package com.prl.backend.repository;

import com.prl.backend.entity.JobPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobPositionRepository extends JpaRepository<JobPosition, Long> {

    List<JobPosition> findByCompanyIdAndActiveTrue(Long companyId);

    boolean existsByNameAndCompanyId(String name, Long companyId);

    @Query("SELECT jp FROM JobPosition jp LEFT JOIN FETCH jp.company WHERE jp.id = :id")
    Optional<JobPosition> findByIdWithCompany(@Param("id") Long id);
}
