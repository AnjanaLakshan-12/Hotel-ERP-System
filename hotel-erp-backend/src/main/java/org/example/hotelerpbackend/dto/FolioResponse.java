package org.example.hotelerpbackend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class FolioResponse {
    private Long reservationId;
    private long nights;
    private BigDecimal roomCharge;
    private BigDecimal serviceChargeTotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private BigDecimal advanceAmount;
    private BigDecimal balanceAmount;
    private String status;


    public FolioResponse(Long reservationId, long nights, BigDecimal roomCharge,
                         BigDecimal serviceChargeTotal, BigDecimal taxAmount,
                         BigDecimal totalAmount, String status,BigDecimal advanceAmount,BigDecimal balanceAmount) {
        this.reservationId = reservationId;
        this.nights = nights;
        this.roomCharge = roomCharge;
        this.serviceChargeTotal = serviceChargeTotal;
        this.taxAmount = taxAmount;
        this.totalAmount = totalAmount;
        this.status = status;
        this.advanceAmount = advanceAmount;
        this.balanceAmount = balanceAmount;
    }
}
