package org.example.hotelerpbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
@AllArgsConstructor
public class DashboardResponse {
    private long totalCustomers;
    private long totalRooms;
    private long availableRooms;
    private long occupiedRooms;
    private long totalReservations;
    private long unpaidBills;
    private BigDecimal totalRevenue;
}
