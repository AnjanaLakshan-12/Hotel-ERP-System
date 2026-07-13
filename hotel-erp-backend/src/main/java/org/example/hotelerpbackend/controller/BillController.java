package org.example.hotelerpbackend.controller;


import org.example.hotelerpbackend.enums.PaymentMethod;
import org.example.hotelerpbackend.service.AzureBlobStorageService;
import org.springframework.core.io.Resource;
import org.example.hotelerpbackend.entity.Bill;
import org.example.hotelerpbackend.enums.BillStatus;
import org.example.hotelerpbackend.service.BillService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;

@RestController
@RequestMapping("/api/bills")
public class BillController {
    private final BillService billService;
    private final AzureBlobStorageService azureBlobStorageService;

    public BillController(BillService billService,  AzureBlobStorageService azureBlobStorageService) {
        this.billService = billService;
        this.azureBlobStorageService = azureBlobStorageService;
    }

    @PostMapping("/generate/{reservationId}")
    public ResponseEntity<?> generateBill(@PathVariable Long reservationId) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(billService.generateBill(reservationId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllBills() {
        return ResponseEntity.ok(billService.getAllBills());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBillById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(billService.getBillById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateBillStatus(
            @PathVariable Long id,
            @RequestParam BillStatus status,
            @RequestParam(required = false) PaymentMethod paymentMethod
    ) {
        try {
            return ResponseEntity.ok(billService.updateBillStatus(id, status, paymentMethod));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }


    @GetMapping("/folio/{reservationId}")
    public ResponseEntity<?> getFolioPreview(@PathVariable Long reservationId) {
        try {
            return ResponseEntity.ok(billService.getFolioPreview(reservationId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id) {
        Bill bill = billService.getBillById(id);

        if (bill.getInvoiceBlobName() == null) {
            return ResponseEntity.notFound().build();
        }

        byte[] pdfBytes = azureBlobStorageService.downloadPdf(bill.getInvoiceBlobName());

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + bill.getInvoiceBlobName() + "\""
                )
                .body(pdfBytes);
    }
}
