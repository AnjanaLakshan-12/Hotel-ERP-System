package org.example.hotelerpbackend.controller;

import org.example.hotelerpbackend.dto.CancelReservationRequest;
import org.example.hotelerpbackend.dto.ProcessCancellationRequest;
import org.example.hotelerpbackend.dto.ReservationRequest;
import org.example.hotelerpbackend.enums.ReservationStatus;
import org.example.hotelerpbackend.service.ReservationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {
    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ResponseEntity<?> createReservation(@RequestBody ReservationRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(reservationService.createReservation(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReservationById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(reservationService.getReservationById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateReservationStatus(
            @PathVariable Long id,
            @RequestParam ReservationStatus status
    ) {
        try {
            return ResponseEntity.ok(reservationService.updateReservationStatus(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/early-checkout")
    public ResponseEntity<?> earlyCheckout(
            @PathVariable Long id,
            @RequestParam LocalDate actualCheckoutDate
    ) {
        try {
            return ResponseEntity.ok(reservationService.earlyCheckout(id, actualCheckoutDate));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelReservation(
            @PathVariable Long id,
            @RequestBody CancelReservationRequest request
    ) {
        try {
            return ResponseEntity.ok(reservationService.cancelReservation(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/request-cancellation")
    public ResponseEntity<?> submitCancellationRequest(
            @PathVariable Long id,
            @RequestBody CancelReservationRequest request
    ) {
        try {
            return ResponseEntity.ok(reservationService.submitCancellationRequest(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/process-cancellation")
    public ResponseEntity<?> processCancellationRequest(
            @PathVariable Long id,
            @RequestBody ProcessCancellationRequest request
    ) {
        try {
            return ResponseEntity.ok(reservationService.processCancellationRequest(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


}
