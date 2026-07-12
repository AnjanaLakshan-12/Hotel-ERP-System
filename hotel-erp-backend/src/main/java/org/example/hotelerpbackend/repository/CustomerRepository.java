package org.example.hotelerpbackend.repository;

import org.example.hotelerpbackend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmail(String email);

    List<Customer> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String firstName,
            String lastName
    );
}
