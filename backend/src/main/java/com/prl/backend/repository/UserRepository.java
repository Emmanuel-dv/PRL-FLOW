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

    List<User> findByCompanyIdAndRole(Long companyId, Role role);

    List<User> findByManagerId(Long managerId);

    boolean existsByEmailAndIdNot(String email, Long id);
}
