package org.example.hotelerpbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.example.hotelerpbackend.enums.CancellationDecision;
import org.example.hotelerpbackend.enums.PaymentMethod;
import org.example.hotelerpbackend.enums.ReservationStatus;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "reservations")
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ToString.Exclude
    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ToString.Exclude
    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(nullable = false)
    private LocalDate checkInDate;

    @Column(nullable = false)
    private LocalDate checkOutDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status = ReservationStatus.CONFIRMED;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ToString.Exclude
    @OneToOne(mappedBy = "reservation")
    @JsonIgnore
    private Bill bill;

    @Column(nullable = false)
    private BigDecimal advanceAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    private PaymentMethod advancePaymentMethod;

    @Column(length = 500)
    private String cancellationReason;

    @Column(nullable = false)
    private Boolean advanceRefunded = false;

    @Column
    private BigDecimal refundedAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CancellationDecision cancellationDecision = CancellationDecision.NONE;


}
