package org.example.hotelerpbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.hotelerpbackend.enums.ChargeType;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "service_charges")
public class ServiceCharge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reservation_id", nullable = false)
    @ToString.Exclude
    private Reservation reservation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChargeType chargeType;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime chargeDate;
}
