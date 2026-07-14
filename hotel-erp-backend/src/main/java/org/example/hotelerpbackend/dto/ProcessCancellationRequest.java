package org.example.hotelerpbackend.dto;


import lombok.Getter;
import lombok.Setter;
import org.example.hotelerpbackend.enums.CancellationDecision;

import java.math.BigDecimal;

@Getter
@Setter
public class ProcessCancellationRequest {
    private CancellationDecision decision;
    private BigDecimal partialRefundAmount;
}