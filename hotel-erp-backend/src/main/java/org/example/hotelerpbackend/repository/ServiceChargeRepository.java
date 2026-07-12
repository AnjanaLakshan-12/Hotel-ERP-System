package org.example.hotelerpbackend.repository;

import org.example.hotelerpbackend.entity.ServiceCharge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceChargeRepository  extends JpaRepository<ServiceCharge, Long> {
    List<ServiceCharge> findByReservationId(Long reservationId);
}
