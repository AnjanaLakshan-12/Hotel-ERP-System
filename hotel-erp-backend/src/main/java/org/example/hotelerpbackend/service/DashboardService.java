package org.example.hotelerpbackend.service;

import org.example.hotelerpbackend.dto.DashboardResponse;
import org.example.hotelerpbackend.entity.Bill;
import org.example.hotelerpbackend.enums.BillStatus;
import org.example.hotelerpbackend.enums.RoomStatus;
import org.example.hotelerpbackend.repository.BillRepository;
import org.example.hotelerpbackend.repository.CustomerRepository;
import org.example.hotelerpbackend.repository.ReservationRepository;
import org.example.hotelerpbackend.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class DashboardService {
    private final CustomerRepository customerRepository;
    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;
    private final BillRepository billRepository;

    public DashboardService(
            CustomerRepository customerRepository,
            RoomRepository roomRepository,
            ReservationRepository reservationRepository,
            BillRepository billRepository
    ) {
        this.customerRepository = customerRepository;
        this.roomRepository = roomRepository;
        this.reservationRepository = reservationRepository;
        this.billRepository = billRepository;
    }

    public DashboardResponse getSummary() {
        BigDecimal totalRevenue = billRepository.findByStatus(BillStatus.PAID)
                .stream()
                .map(Bill::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DashboardResponse(
                customerRepository.count(),
                roomRepository.count(),
                roomRepository.findByStatus(RoomStatus.AVAILABLE).size(),
                roomRepository.findByStatus(RoomStatus.OCCUPIED).size(),
                reservationRepository.count(),
                billRepository.findByStatus(BillStatus.UNPAID).size(),
                totalRevenue
        );
    }
}
