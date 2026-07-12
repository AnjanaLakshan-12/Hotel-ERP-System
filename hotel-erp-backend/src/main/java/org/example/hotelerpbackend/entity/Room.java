package org.example.hotelerpbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.example.hotelerpbackend.enums.RoomStatus;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String roomNumber;

    @Column(nullable = false)
    private String roomType;

    @Column(nullable = false)
    private BigDecimal pricePerNight;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomStatus status = RoomStatus.AVAILABLE;

    @OneToMany(mappedBy = "room")
    @JsonIgnore
    private List<Reservation> reservations;

    @Column(nullable = false)
    private Integer floor;
}
