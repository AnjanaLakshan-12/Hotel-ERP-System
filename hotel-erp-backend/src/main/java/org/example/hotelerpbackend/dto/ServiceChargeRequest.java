package org.example.hotelerpbackend.dto;

import lombok.*;
import org.example.hotelerpbackend.enums.ChargeType;

import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ServiceChargeRequest {
    private Long reservationId;
    private ChargeType chargeType;
    private String description;
    private BigDecimal unitPrice;
    private int quantity;
}
