package org.example.hotelerpbackend.service;

import org.example.hotelerpbackend.dto.ServiceChargeRequest;
import org.example.hotelerpbackend.entity.Reservation;
import org.example.hotelerpbackend.entity.ServiceCharge;
import org.example.hotelerpbackend.enums.ReservationStatus;
import org.example.hotelerpbackend.repository.ReservationRepository;
import org.example.hotelerpbackend.repository.ServiceChargeRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ServiceChargeService {
    private final ServiceChargeRepository serviceChargeRepository;
    private final ReservationRepository reservationRepository;

    public ServiceChargeService(ServiceChargeRepository serviceChargeRepository,
                                ReservationRepository reservationRepository) {
        this.serviceChargeRepository = serviceChargeRepository;
        this.reservationRepository = reservationRepository;
    }


    public ServiceCharge addServiceCharge(ServiceChargeRequest request) {
        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (reservation.getStatus() != ReservationStatus.CHECKED_IN) {
            throw new RuntimeException("Service charges can only be added for checked-in guests");
        }

        ServiceCharge charge = new ServiceCharge();
        charge.setReservation(reservation);
        charge.setChargeType(request.getChargeType());
        charge.setDescription(request.getDescription());
        charge.setUnitPrice(request.getUnitPrice());
        charge.setQuantity(request.getQuantity());
        charge.setTotalAmount(request.getUnitPrice().multiply(BigDecimal.valueOf(request.getQuantity())));

        return serviceChargeRepository.save(charge);
    }

    public List<ServiceCharge> getChargesByReservation(Long reservationId) {
        return serviceChargeRepository.findByReservationId(reservationId);
    }

    public List<ServiceCharge> getAllCharges() {
        return serviceChargeRepository.findAll();
    }
}
