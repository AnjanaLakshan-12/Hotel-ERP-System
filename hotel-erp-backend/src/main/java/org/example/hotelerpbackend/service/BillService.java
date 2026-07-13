package org.example.hotelerpbackend.service;

import org.example.hotelerpbackend.dto.FolioResponse;
import org.example.hotelerpbackend.entity.Bill;
import org.example.hotelerpbackend.entity.Reservation;
import org.example.hotelerpbackend.entity.ServiceCharge;
import org.example.hotelerpbackend.enums.BillStatus;
import org.example.hotelerpbackend.enums.PaymentMethod;
import org.example.hotelerpbackend.enums.ReservationStatus;
import org.example.hotelerpbackend.repository.BillRepository;
import org.example.hotelerpbackend.repository.ReservationRepository;
import org.example.hotelerpbackend.repository.ServiceChargeRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BillService {
    private static final BigDecimal TAX_RATE = new BigDecimal("0.10");

    private final BillRepository billRepository;
    private final ReservationRepository reservationRepository;
    private final ReservationService reservationService;
    private final ServiceChargeService serviceChargeService;
    private final InvoicePdfService invoicePdfService;

    public BillService(
            BillRepository billRepository,
            ReservationRepository reservationRepository,
            ReservationService reservationService,
            ServiceChargeService serviceChargeService,
            InvoicePdfService invoicePdfService

    ) {
        this.billRepository = billRepository;
        this.reservationRepository = reservationRepository;
        this.reservationService = reservationService;
        this.serviceChargeService = serviceChargeService;
        this.invoicePdfService = invoicePdfService;
    }

    public Bill generateBill(Long reservationId) {
        billRepository.findByReservationId(reservationId).ifPresent(existing -> {
            throw new RuntimeException("Bill already exists for this reservation");
        });

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (reservation.getStatus() != ReservationStatus.CHECKED_OUT) {
            throw new RuntimeException("Final invoice can only be generated after checkout");
        }

        long nights = reservationService.calculateNights(reservation);

        BigDecimal roomCharge = reservation.getRoom().getPricePerNight()
                .multiply(BigDecimal.valueOf(nights));

        BigDecimal serviceChargeTotal = serviceChargeService.getChargesByReservation(reservationId)
                .stream()
                .map(ServiceCharge::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal subtotal = roomCharge.add(serviceChargeTotal);

        BigDecimal taxAmount = subtotal.multiply(TAX_RATE)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalAmount = subtotal.add(taxAmount);

        BigDecimal advanceAmount = reservation.getAdvanceAmount() == null
                ? BigDecimal.ZERO
                : reservation.getAdvanceAmount();

        BigDecimal balanceAmount = totalAmount.subtract(advanceAmount);
        if (balanceAmount.compareTo(BigDecimal.ZERO) < 0) {
            balanceAmount = BigDecimal.ZERO;
        }

        Bill bill = new Bill();
        bill.setServiceChargeTotal(serviceChargeTotal);
        bill.setReservation(reservation);
        bill.setNights(nights);
        bill.setRoomCharge(roomCharge);
        bill.setTaxAmount(taxAmount);
        bill.setTotalAmount(totalAmount);
        bill.setStatus(BillStatus.UNPAID);
        bill.setAdvanceAmount(advanceAmount);
        bill.setBalanceAmount(balanceAmount);

        Bill savedBill = billRepository.save(bill);

        String invoiceUrl = invoicePdfService.generateInvoicePdf(savedBill);
        savedBill.setInvoiceFilePath(invoiceUrl);
        savedBill.setInvoiceBlobName("INV-" + String.format("%04d", savedBill.getId()) + ".pdf");

        return billRepository.save(savedBill);
    }

    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    public Bill getBillById(Long id) {
        return billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("invoice not found"));
    }


    public Bill updateBillStatus(Long id, BillStatus status, PaymentMethod paymentMethod) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        bill.setStatus(status);

        if (status == BillStatus.PAID) {
            if (paymentMethod == null) {
                throw new RuntimeException("Payment method is required when marking invoice as paid");
            }

            bill.setPaymentMethod(paymentMethod);
            bill.setPaidAt(LocalDateTime.now());
        }

        if (status == BillStatus.UNPAID) {
            bill.setPaymentMethod(null);
            bill.setPaidAt(null);
        }

        if (status == BillStatus.CANCELLED) {
            bill.setPaymentMethod(null);
            bill.setPaidAt(null);
        }

        Bill savedBill = billRepository.save(bill);

        String invoiceFilePath = invoicePdfService.generateInvoicePdf(savedBill);
        savedBill.setInvoiceFilePath(invoiceFilePath);

        return billRepository.save(savedBill);
    }




    public FolioResponse getFolioPreview(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        long nights = reservationService.calculateNights(reservation);

        BigDecimal roomCharge = reservation.getRoom().getPricePerNight()
                .multiply(BigDecimal.valueOf(nights));

        BigDecimal serviceChargeTotal = serviceChargeService.getChargesByReservation(reservationId)
                .stream()
                .map(ServiceCharge::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal advanceAmount = reservation.getAdvanceAmount() == null
                ? BigDecimal.ZERO
                : reservation.getAdvanceAmount();

        BigDecimal subtotal = roomCharge.add(serviceChargeTotal);

        BigDecimal taxAmount = subtotal.multiply(TAX_RATE)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalAmount = subtotal.add(taxAmount);

        BigDecimal balanceAmount = totalAmount.subtract(advanceAmount);
        if (balanceAmount.compareTo(BigDecimal.ZERO) < 0) {
            balanceAmount = BigDecimal.ZERO;
        }

        return new FolioResponse(
                reservation.getId(),
                nights,
                roomCharge,
                serviceChargeTotal,
                taxAmount,
                totalAmount,
                "INTERIM_FOLIO",
                advanceAmount,
                balanceAmount
        );
    }



}
