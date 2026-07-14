package org.example.hotelerpbackend.service;

import org.example.hotelerpbackend.dto.DashboardResponse;
import org.example.hotelerpbackend.entity.Bill;
import org.example.hotelerpbackend.enums.BillStatus;
import org.example.hotelerpbackend.enums.ReservationStatus;
import org.example.hotelerpbackend.enums.RoomStatus;
import org.example.hotelerpbackend.repository.BillRepository;
import org.example.hotelerpbackend.repository.ReservationRepository;
import org.example.hotelerpbackend.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class DashboardService {
    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;
    private final BillRepository billRepository;

    public DashboardService(
            RoomRepository roomRepository,
            ReservationRepository reservationRepository,
            BillRepository billRepository
    ) {
        this.roomRepository = roomRepository;
        this.reservationRepository = reservationRepository;
        this.billRepository = billRepository;
    }

    public DashboardResponse getSummary() {
        LocalDate today = LocalDate.now();

        BigDecimal totalRevenue = billRepository.findByStatus(BillStatus.PAID)
                .stream()
                .map(bill -> bill.getTotalAmount() == null ? BigDecimal.ZERO : bill.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DashboardResponse(
                reservationRepository.countByCheckInDate(today),
                reservationRepository.countByStatus(ReservationStatus.CONFIRMED),
                reservationRepository.countByStatus(ReservationStatus.CHECKED_IN),

                roomRepository.count(),
                roomRepository.countByStatus(RoomStatus.AVAILABLE),
                roomRepository.countByStatus(RoomStatus.OCCUPIED),
                roomRepository.countByStatus(RoomStatus.MAINTENANCE),

                reservationRepository.countByCheckInDate(today),
                reservationRepository.countByStatus(ReservationStatus.CHECKED_IN),
                reservationRepository.countByStatus(ReservationStatus.CHECKED_OUT),
                reservationRepository.countByStatus(ReservationStatus.CANCELLED),
                reservationRepository.countByStatus(ReservationStatus.CANCELLATION_REQUESTED),

                billRepository.countByStatus(BillStatus.PAID),
                billRepository.countByStatus(BillStatus.UNPAID),
                totalRevenue
        );
    }
}
