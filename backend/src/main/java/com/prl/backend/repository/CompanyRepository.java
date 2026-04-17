package com.prl.backend.repository;

import com.prl.backend.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByCif(String cif);

    boolean existsByCif(String cif);

    List<Company> findByActiveTrue();
}
