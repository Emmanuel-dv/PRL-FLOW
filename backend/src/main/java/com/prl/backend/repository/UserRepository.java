package com.prl.backend.repository;

import com.prl.backend.entity.User;
import com.prl.backend.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndActiveTrue(String email);

    boolean existsByEmail(String email);

    List<User> findByCompanyIdAndActiveTrue(Long companyId);

    List<User> findByCompany_IdAndRole(Long companyId, Role role);

    List<User> findByManager_Id(Long managerId);

    boolean existsByEmailAndIdNot(String email, Long id);

    long countByCompany_IdAndRoleAndActiveTrue(Long companyId, Role role);

    long countByCompany_IdAndActiveTrue(Long companyId);
}
