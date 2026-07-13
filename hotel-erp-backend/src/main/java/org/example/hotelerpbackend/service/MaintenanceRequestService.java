package org.example.hotelerpbackend.service;


import org.example.hotelerpbackend.dto.MaintenanceRequestDto;
import org.example.hotelerpbackend.entity.MaintenanceRequest;
import org.example.hotelerpbackend.entity.Room;
import org.example.hotelerpbackend.enums.MaintenanceStatus;
import org.example.hotelerpbackend.enums.RoomStatus;
import org.example.hotelerpbackend.repository.MaintenanceRequestRepository;
import org.example.hotelerpbackend.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MaintenanceRequestService {

    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final RoomRepository roomRepository;

    public MaintenanceRequestService(
            MaintenanceRequestRepository maintenanceRequestRepository,
            RoomRepository roomRepository
    ) {
        this.maintenanceRequestRepository = maintenanceRequestRepository;
        this.roomRepository = roomRepository;
    }

    public MaintenanceRequest createRequest(MaintenanceRequestDto requestDto) {
        Room room = roomRepository.findById(requestDto.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        MaintenanceRequest request = new MaintenanceRequest();
        request.setRoom(room);
        request.setReportedBy(requestDto.getReportedBy());
        request.setIssueTitle(requestDto.getIssueTitle());
        request.setDescription(requestDto.getDescription());

        if (requestDto.getPriority() != null) {
            request.setPriority(requestDto.getPriority());
        }

        request.setStatus(MaintenanceStatus.PENDING);
        request.setReportedAt(LocalDateTime.now());

        return maintenanceRequestRepository.save(request);
    }

    public List<MaintenanceRequest> getAllRequests() {
        return maintenanceRequestRepository.findAll();
    }

    public List<MaintenanceRequest> getPendingRequests() {
        return maintenanceRequestRepository.findByStatus(MaintenanceStatus.PENDING);
    }

    public MaintenanceRequest approveRequest(Long id, String managerNote) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance request not found"));

        request.setStatus(MaintenanceStatus.APPROVED);
        request.setManagerNote(managerNote);
        request.setReviewedAt(LocalDateTime.now());

        Room room = request.getRoom();
        room.setStatus(RoomStatus.MAINTENANCE);
        roomRepository.save(room);

        return maintenanceRequestRepository.save(request);
    }

    public MaintenanceRequest rejectRequest(Long id, String managerNote) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance request not found"));

        request.setStatus(MaintenanceStatus.REJECTED);
        request.setManagerNote(managerNote);
        request.setReviewedAt(LocalDateTime.now());

        return maintenanceRequestRepository.save(request);
    }

    public MaintenanceRequest completeRequest(Long id) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance request not found"));

        request.setStatus(MaintenanceStatus.COMPLETED);
        request.setReviewedAt(LocalDateTime.now());

        Room room = request.getRoom();
        room.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room);

        return maintenanceRequestRepository.save(request);
    }
}
