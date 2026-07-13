package org.example.hotelerpbackend.dto;


import lombok.Getter;
import lombok.Setter;
import org.example.hotelerpbackend.enums.MaintenancePriority;

@Getter
@Setter
public class MaintenanceRequestDto {
    private Long roomId;
    private String reportedBy;
    private String issueTitle;
    private String description;
    private MaintenancePriority priority;
}
