package org.example.hotelerpbackend.controller;

import org.example.hotelerpbackend.dto.MaintenanceRequestDto;
import org.example.hotelerpbackend.service.MaintenanceRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/maintenance-requests")
@CrossOrigin("*")
public class MaintenanceRequestController {

    private final MaintenanceRequestService maintenanceRequestService;

    public MaintenanceRequestController(MaintenanceRequestService maintenanceRequestService) {
        this.maintenanceRequestService = maintenanceRequestService;
    }

    @PostMapping
    public ResponseEntity<?> createRequest(@RequestBody MaintenanceRequestDto requestDto) {
        try {
            return ResponseEntity.ok(maintenanceRequestService.createRequest(requestDto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllRequests() {
        return ResponseEntity.ok(maintenanceRequestService.getAllRequests());
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingRequests() {
        return ResponseEntity.ok(maintenanceRequestService.getPendingRequests());
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approveRequest(
            @PathVariable Long id,
            @RequestParam(required = false) String managerNote
    ) {
        try {
            return ResponseEntity.ok(maintenanceRequestService.approveRequest(id, managerNote));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(
            @PathVariable Long id,
            @RequestParam(required = false) String managerNote
    ) {
        try {
            return ResponseEntity.ok(maintenanceRequestService.rejectRequest(id, managerNote));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<?> completeRequest(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(maintenanceRequestService.completeRequest(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}