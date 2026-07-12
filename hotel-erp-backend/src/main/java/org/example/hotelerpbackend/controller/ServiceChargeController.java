package org.example.hotelerpbackend.controller;

import org.example.hotelerpbackend.dto.ServiceChargeRequest;
import org.example.hotelerpbackend.service.ServiceChargeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/service-charges")
public class ServiceChargeController {
    private final ServiceChargeService serviceChargeService;

    public ServiceChargeController(ServiceChargeService serviceChargeService) {
        this.serviceChargeService = serviceChargeService;
    }

    @PostMapping
    public ResponseEntity<?> addServiceCharge(@RequestBody ServiceChargeRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(serviceChargeService.addServiceCharge(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllCharges() {
        return ResponseEntity.ok(serviceChargeService.getAllCharges());
    }

    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<?> getChargesByReservation(@PathVariable Long reservationId) {
        return ResponseEntity.ok(serviceChargeService.getChargesByReservation(reservationId));
    }
}
