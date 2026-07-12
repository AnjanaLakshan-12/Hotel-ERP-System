package org.example.hotelerpbackend.dto;

import lombok.Getter;
import lombok.Setter;
import org.example.hotelerpbackend.enums.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class ReservationRequest {
    private Long customerId;
    private Long roomId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private BigDecimal advanceAmount;
    private PaymentMethod advancePaymentMethod;
}
