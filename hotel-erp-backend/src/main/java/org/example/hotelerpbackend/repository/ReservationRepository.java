package org.example.hotelerpbackend.repository;

import org.example.hotelerpbackend.entity.Reservation;
import org.example.hotelerpbackend.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByCustomerId(Long customerId);

    List<Reservation> findByRoomId(Long roomId);

    List<Reservation> findByStatus(ReservationStatus status);

    long countByCheckInDate(LocalDate checkInDate);

    long countByStatus(ReservationStatus status);
}
