package org.example.hotelerpbackend.repository;

import org.example.hotelerpbackend.entity.AppUser;
import org.example.hotelerpbackend.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);

    boolean existsByEmail(String email);

    List<AppUser> findTop5ByOrderByIdDesc();

    long countByActiveTrue();

    long countByActiveFalse();

    long countByRole(UserRole role);
}
