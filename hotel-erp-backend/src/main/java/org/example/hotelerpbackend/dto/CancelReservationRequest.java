package org.example.hotelerpbackend.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CancelReservationRequest {
    private String cancellationReason;
}
