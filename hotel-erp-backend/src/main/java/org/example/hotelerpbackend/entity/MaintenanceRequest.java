package org.example.hotelerpbackend.entity;


import jakarta.persistence.*;
import lombok.*;
import org.example.hotelerpbackend.enums.MaintenancePriority;
import org.example.hotelerpbackend.enums.MaintenanceStatus;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "maintenance_requests")
public class MaintenanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Room room;

    @Column(nullable = false)
    private String reportedBy;

    @Column(nullable = false)
    private String issueTitle;

    @Column(nullable = false, length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenancePriority priority = MaintenancePriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenanceStatus status = MaintenanceStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime reportedAt = LocalDateTime.now();

    private LocalDateTime reviewedAt;

    private String managerNote;
}