package org.example.hotelerpbackend.entity;


import jakarta.persistence.*;
import lombok.*;
import org.example.hotelerpbackend.enums.BillStatus;
import org.example.hotelerpbackend.enums.PaymentMethod;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "bills")
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "reservation_id", nullable = false, unique = true)
    private Reservation reservation;

    @Column(nullable = false)
    private long nights;

    @Column(nullable = false)
    private BigDecimal roomCharge;

    @Column(nullable = false)
    private BigDecimal taxAmount;

    @Column(nullable = false)
    private BigDecimal totalAmount;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillStatus status = BillStatus.UNPAID;

    private LocalDateTime paidAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private BigDecimal serviceChargeTotal = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal advanceAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal balanceAmount = BigDecimal.ZERO;

    @Column
    private String invoiceFilePath;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;



}
