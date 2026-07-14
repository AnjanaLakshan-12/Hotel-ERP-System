package org.example.hotelerpbackend.service;

import jakarta.transaction.Transactional;
import org.example.hotelerpbackend.dto.CancelReservationRequest;
import org.example.hotelerpbackend.dto.ProcessCancellationRequest;
import org.example.hotelerpbackend.dto.ReservationRequest;
import org.example.hotelerpbackend.entity.Bill;
import org.example.hotelerpbackend.entity.Customer;
import org.example.hotelerpbackend.entity.Reservation;
import org.example.hotelerpbackend.entity.Room;
import org.example.hotelerpbackend.enums.BillStatus;
import org.example.hotelerpbackend.enums.CancellationDecision;
import org.example.hotelerpbackend.enums.ReservationStatus;
import org.example.hotelerpbackend.enums.RoomStatus;
import org.example.hotelerpbackend.repository.BillRepository;
import org.example.hotelerpbackend.repository.CustomerRepository;
import org.example.hotelerpbackend.repository.ReservationRepository;
import org.example.hotelerpbackend.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ReservationService {

    private static final BigDecimal TAX_RATE = new BigDecimal("0.10");

    private final ReservationRepository reservationRepository;
    private final CustomerRepository customerRepository;
    private final RoomRepository roomRepository;
    private final BillRepository billRepository;

    public ReservationService(
            ReservationRepository reservationRepository,
            CustomerRepository customerRepository,
            RoomRepository roomRepository,
            BillRepository billRepository
    ) {
        this.reservationRepository = reservationRepository;
        this.customerRepository = customerRepository;
        this.roomRepository = roomRepository;
        this.billRepository = billRepository;
    }

    @Transactional
    public Reservation createReservation(ReservationRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new RuntimeException("Room is not available");
        }

        if (request.getCheckOutDate().isBefore(request.getCheckInDate())
                || request.getCheckOutDate().isEqual(request.getCheckInDate())) {
            throw new RuntimeException("Check-out date must be after check-in date");
        }

        BigDecimal advanceAmount = request.getAdvanceAmount() == null
                ? BigDecimal.ZERO
                : request.getAdvanceAmount();

        if (advanceAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Advance amount cannot be negative");
        }



        Reservation reservation = new Reservation();
        reservation.setCustomer(customer);
        reservation.setRoom(room);
        reservation.setCheckInDate(request.getCheckInDate());
        reservation.setCheckOutDate(request.getCheckOutDate());
        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservation.setAdvanceAmount(advanceAmount);

        reservation.setCancellationDecision(CancellationDecision.NONE);
        reservation.setAdvanceRefunded(false);
        reservation.setRefundedAmount(BigDecimal.ZERO);

        if (advanceAmount.compareTo(BigDecimal.ZERO) > 0) {
            reservation.setAdvancePaymentMethod(request.getAdvancePaymentMethod());
        } else {
            reservation.setAdvancePaymentMethod(null);
        }

        room.setStatus(RoomStatus.OCCUPIED);
        roomRepository.save(room);

        return reservationRepository.save(reservation);
    }



    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    public Reservation getReservationById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
    }

    @Transactional
    public Reservation updateReservationStatus(Long id, ReservationStatus status) {
        Reservation reservation = getReservationById(id);

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new RuntimeException("Cancelled reservation status cannot be changed.");
        }

        if (reservation.getStatus() == ReservationStatus.CANCELLATION_REQUESTED) {
            throw new RuntimeException("Reservation is waiting for manager cancellation review.");
        }

        if (status == ReservationStatus.CANCELLED) {
            throw new RuntimeException("Use the cancellation process to cancel a reservation.");
        }

        if (status == ReservationStatus.CANCELLATION_REQUESTED) {
            throw new RuntimeException("Use the cancellation request process.");
        }

        if (status == ReservationStatus.CHECKED_IN &&
                reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new RuntimeException("Only confirmed reservations can be checked in.");
        }

        if (status == ReservationStatus.CHECKED_OUT &&
                reservation.getStatus() != ReservationStatus.CHECKED_IN) {
            throw new RuntimeException("Only checked-in reservations can be checked out.");
        }

        reservation.setStatus(status);

        if (status == ReservationStatus.CHECKED_IN) {
            Room room = reservation.getRoom();
            room.setStatus(RoomStatus.OCCUPIED);
            roomRepository.save(room);
        }

        if (status == ReservationStatus.CHECKED_OUT) {
            Room room = reservation.getRoom();
            room.setStatus(RoomStatus.AVAILABLE);
            roomRepository.save(room);
        }

        return reservationRepository.save(reservation);
    }

    public long calculateNights(Reservation reservation) {
        return ChronoUnit.DAYS.between(
                reservation.getCheckInDate(),
                reservation.getCheckOutDate()
        );
    }

    @Transactional
    public Reservation earlyCheckout(Long id, LocalDate actualCheckoutDate) {
        Reservation reservation = getReservationById(id);

        if (reservation.getStatus() != ReservationStatus.CHECKED_IN) {
            throw new RuntimeException("Only checked-in reservations can use early checkout.");
        }

        if (actualCheckoutDate == null) {
            throw new RuntimeException("Actual checkout date is required");
        }

        if (!actualCheckoutDate.isAfter(reservation.getCheckInDate())) {
            throw new RuntimeException("Actual checkout date must be after check-in date");
        }

        if (actualCheckoutDate.isAfter(reservation.getCheckOutDate())) {
            throw new RuntimeException("Actual checkout date cannot be after the planned checkout date");
        }

        reservation.setCheckOutDate(actualCheckoutDate);
        reservation.setStatus(ReservationStatus.CHECKED_OUT);

        Room room = reservation.getRoom();
        room.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room);

        billRepository.findByReservationId(id)
                .ifPresent(bill -> recalculateBillForEarlyCheckout(bill, reservation));

        return reservationRepository.save(reservation);
    }


    private void recalculateBillForEarlyCheckout(Bill bill, Reservation reservation) {
        if (bill.getStatus() == BillStatus.PAID) {
            throw new RuntimeException("Paid bill cannot be adjusted during early checkout");
        }

        if (bill.getStatus() == BillStatus.CANCELLED) {
            return;
        }

        long nights = calculateNights(reservation);

        BigDecimal roomCharge = reservation.getRoom().getPricePerNight()
                .multiply(BigDecimal.valueOf(nights));

        BigDecimal taxAmount = roomCharge.multiply(TAX_RATE)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalAmount = roomCharge.add(taxAmount);

        bill.setNights(nights);
        bill.setRoomCharge(roomCharge);
        bill.setTaxAmount(taxAmount);
        bill.setTotalAmount(totalAmount);

        billRepository.save(bill);
    }

//    public Reservation cancelReservation(Long id, CancelReservationRequest request) {
//        Reservation reservation = reservationRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Reservation not found"));
//
//        if (reservation.getStatus() == ReservationStatus.CHECKED_IN) {
//            throw new RuntimeException("Checked-in reservation cannot be cancelled. Please use checkout or early checkout.");
//        }
//
//        if (reservation.getStatus() == ReservationStatus.CHECKED_OUT) {
//            throw new RuntimeException("Checked-out reservation cannot be cancelled.");
//        }
//
//        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
//            throw new RuntimeException("Reservation is already cancelled.");
//        }
//
//        if (request.getCancellationReason() == null || request.getCancellationReason().trim().isEmpty()) {
//            throw new RuntimeException("Cancellation reason is required.");
//        }
//
//        reservation.setStatus(ReservationStatus.CANCELLED);
//        reservation.setCancellationReason(request.getCancellationReason().trim());
//
//        LocalDateTime now = LocalDateTime.now();
//        LocalDateTime checkInDateTime = reservation.getCheckInDate().atStartOfDay();
//
//        long hoursBeforeCheckIn = ChronoUnit.HOURS.between(now, checkInDateTime);
//        boolean eligibleForRefund = hoursBeforeCheckIn >= 24;
//
//        BigDecimal advanceAmount = reservation.getAdvanceAmount() == null
//                ? BigDecimal.ZERO
//                : reservation.getAdvanceAmount();
//
//        boolean shouldRefund = eligibleForRefund && advanceAmount.compareTo(BigDecimal.ZERO) > 0;
//
//        reservation.setAdvanceRefunded(shouldRefund);
//
//        if (shouldRefund) {
//            reservation.setRefundedAmount(advanceAmount);
//        } else {
//            reservation.setRefundedAmount(BigDecimal.ZERO);
//        }
//
//        reservation.getRoom().setStatus(RoomStatus.AVAILABLE);
//        roomRepository.save(reservation.getRoom());
//
//        return reservationRepository.save(reservation);
//    }

    @Transactional
    public Reservation submitCancellationRequest(Long id, CancelReservationRequest request) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (reservation.getStatus() == ReservationStatus.CHECKED_IN) {
            throw new RuntimeException("Checked-in reservation cannot be cancelled. Please use checkout or early checkout.");
        }

        if (reservation.getStatus() == ReservationStatus.CHECKED_OUT) {
            throw new RuntimeException("Checked-out reservation cannot be cancelled.");
        }

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new RuntimeException("Reservation is already cancelled.");
        }

        if (reservation.getStatus() == ReservationStatus.CANCELLATION_REQUESTED) {
            throw new RuntimeException("Cancellation request is already waiting for manager review.");
        }

        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new RuntimeException("Only confirmed reservations can request cancellation.");
        }

        if (request.getCancellationReason() == null || request.getCancellationReason().trim().isEmpty()) {
            throw new RuntimeException("Cancellation reason is required.");
        }

        reservation.setStatus(ReservationStatus.CANCELLATION_REQUESTED);
        reservation.setCancellationDecision(CancellationDecision.REQUESTED);
        reservation.setCancellationReason(request.getCancellationReason().trim());
        reservation.setAdvanceRefunded(false);
        reservation.setRefundedAmount(BigDecimal.ZERO);

        return reservationRepository.save(reservation);
    }


    @Transactional
    public Reservation processCancellationRequest(Long id, ProcessCancellationRequest request) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (reservation.getStatus() != ReservationStatus.CANCELLATION_REQUESTED) {
            throw new RuntimeException("Reservation is not waiting for cancellation review.");
        }

        if (request.getDecision() == null) {
            throw new RuntimeException("Cancellation decision is required.");
        }

        BigDecimal advanceAmount = reservation.getAdvanceAmount() == null
                ? BigDecimal.ZERO
                : reservation.getAdvanceAmount();

        BigDecimal refundedAmount;
        boolean advanceRefunded;

        switch (request.getDecision()) {
            case APPROVED_FULL_REFUND:
                refundedAmount = advanceAmount;
                advanceRefunded = advanceAmount.compareTo(BigDecimal.ZERO) > 0;
                approveCancellation(reservation, request.getDecision(), refundedAmount, advanceRefunded);
                break;

            case APPROVED_NO_REFUND:
                refundedAmount = BigDecimal.ZERO;
                advanceRefunded = false;
                approveCancellation(reservation, request.getDecision(), refundedAmount, advanceRefunded);
                break;

            case APPROVED_PARTIAL_REFUND:
                if (request.getPartialRefundAmount() == null) {
                    throw new RuntimeException("Partial refund amount is required.");
                }

                if (request.getPartialRefundAmount().compareTo(BigDecimal.ZERO) < 0) {
                    throw new RuntimeException("Partial refund amount cannot be negative.");
                }

                if (request.getPartialRefundAmount().compareTo(advanceAmount) > 0) {
                    throw new RuntimeException("Partial refund cannot exceed advance amount.");
                }

                refundedAmount = request.getPartialRefundAmount();
                advanceRefunded = refundedAmount.compareTo(BigDecimal.ZERO) > 0;
                approveCancellation(reservation, request.getDecision(), refundedAmount, advanceRefunded);
                break;

            case REJECTED:
                rejectCancellation(reservation);
                break;

            default:
                throw new RuntimeException("Invalid cancellation decision.");
        }

        return reservationRepository.save(reservation);
    }

    private void approveCancellation(
            Reservation reservation,
            CancellationDecision decision,
            BigDecimal refundedAmount,
            boolean advanceRefunded
    ) {
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setCancellationDecision(decision);
        reservation.setAdvanceRefunded(advanceRefunded);
        reservation.setRefundedAmount(refundedAmount);

        Room room = reservation.getRoom();
        room.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room);
    }
    private void rejectCancellation(Reservation reservation) {
        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservation.setCancellationDecision(CancellationDecision.REJECTED);
        reservation.setAdvanceRefunded(false);
        reservation.setRefundedAmount(BigDecimal.ZERO);
    }

}
