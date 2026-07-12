package org.example.hotelerpbackend.repository;

import org.example.hotelerpbackend.entity.Bill;
import org.example.hotelerpbackend.enums.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {
    Optional<Bill> findByReservationId(Long reservationId);

    List<Bill> findByStatus(BillStatus status);
}
