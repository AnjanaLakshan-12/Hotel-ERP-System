package org.example.hotelerpbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
@AllArgsConstructor
public class DashboardResponse {
    private long customersArrivingToday;
    private long confirmedReservations;
    private long customersInHouse;

    private long totalRooms;
    private long availableRooms;
    private long occupiedRooms;
    private long maintenanceRooms;

    private long reservationsToday;
    private long checkedInReservations;
    private long checkedOutReservations;
    private long cancelledReservations;
    private long pendingCancellationRequests;

    private long paidInvoices;
    private long unpaidInvoices;
    private BigDecimal paidRevenue;
}
