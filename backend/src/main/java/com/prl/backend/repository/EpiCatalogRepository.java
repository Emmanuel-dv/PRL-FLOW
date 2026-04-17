package com.prl.backend.repository;

import com.prl.backend.entity.EpiCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EpiCatalogRepository extends JpaRepository<EpiCatalog, Long> {

    List<EpiCatalog> findByCompanyIdAndActiveTrue(Long companyId);

    boolean existsByNameAndCompanyId(String name, Long companyId);
}
