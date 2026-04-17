package com.prl.backend.repository;

import com.prl.backend.entity.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentTypeRepository extends JpaRepository<DocumentType, Long> {

    List<DocumentType> findByCompanyIdAndActiveTrue(Long companyId);

    boolean existsByNameAndCompanyId(String name, Long companyId);
}
