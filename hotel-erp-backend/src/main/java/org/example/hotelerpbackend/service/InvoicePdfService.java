package org.example.hotelerpbackend.service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.example.hotelerpbackend.entity.Bill;
import org.example.hotelerpbackend.entity.ServiceCharge;
import org.example.hotelerpbackend.repository.ServiceChargeRepository;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;


@Service
public class InvoicePdfService {
      private final ServiceChargeRepository serviceChargeRepository;
      private final AzureBlobStorageService azureBlobStorageService;

    public InvoicePdfService(ServiceChargeRepository serviceChargeRepository, AzureBlobStorageService azureBlobStorageService) {
        this.serviceChargeRepository = serviceChargeRepository;
        this.azureBlobStorageService = azureBlobStorageService;
    }

    public String generateInvoicePdf(Bill bill) {
        try {
            String invoiceNumber = formatInvoiceNumber(bill.getId());
            String fileName = invoiceNumber + ".pdf";

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, outputStream);
            document.open();

            addHeader(document, invoiceNumber);
            addGuestAndReservationDetails(document, bill);
            addChargeTable(document, bill);
            addTotals(document, bill);
            addFooter(document);

            document.close();

            byte[] pdfBytes = outputStream.toByteArray();

            return azureBlobStorageService.uploadPdf(fileName, pdfBytes);

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate invoice PDF: " + e.getMessage());
        }
    }


    private void addHeader(Document document, String invoiceNumber) throws Exception {
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Color.BLACK);
        Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.DARK_GRAY);

        Paragraph hotelName = new Paragraph("HOTEL SUNRISE MANAGEMENT SYSTEM", titleFont);
        hotelName.setAlignment(Element.ALIGN_CENTER);
        document.add(hotelName);

        Paragraph address = new Paragraph("Colombo, Sri Lanka | +94 70 000 0000 | info@hotelsunrise.com", subTitleFont);
        address.setAlignment(Element.ALIGN_CENTER);
        document.add(address);

        Paragraph invoiceTitle = new Paragraph("INVOICE " + invoiceNumber, titleFont);
        invoiceTitle.setSpacingBefore(20);
        invoiceTitle.setAlignment(Element.ALIGN_CENTER);
        document.add(invoiceTitle);

        Paragraph generatedDate = new Paragraph(
                "Generated On: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                subTitleFont
        );
        generatedDate.setAlignment(Element.ALIGN_CENTER);
        generatedDate.setSpacingAfter(20);
        document.add(generatedDate);
    }

    private void addGuestAndReservationDetails(Document document, Bill bill) throws Exception {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingAfter(20);
        table.setWidths(new float[]{1, 1});

        PdfPCell guestCell = new PdfPCell();
        guestCell.setPadding(10);
        guestCell.addElement(new Paragraph("Guest Details", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13)));
        guestCell.addElement(new Paragraph(
                bill.getReservation().getCustomer().getFirstName() + " " +
                        bill.getReservation().getCustomer().getLastName()
        ));
        guestCell.addElement(new Paragraph("Email: " + bill.getReservation().getCustomer().getEmail()));
        guestCell.addElement(new Paragraph("Phone: " + bill.getReservation().getCustomer().getPhone()));

        PdfPCell reservationCell = new PdfPCell();
        reservationCell.setPadding(10);
        reservationCell.addElement(new Paragraph("Reservation Details", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13)));
        reservationCell.addElement(new Paragraph("Reservation No: " + formatReservationNumber(bill.getReservation().getId())));
        reservationCell.addElement(new Paragraph("Room: " + bill.getReservation().getRoom().getRoomNumber()));
        reservationCell.addElement(new Paragraph("Room Type: " + bill.getReservation().getRoom().getRoomType()));
        reservationCell.addElement(new Paragraph("Floor: " + bill.getReservation().getRoom().getFloor()));
        reservationCell.addElement(new Paragraph("Check-in: " + bill.getReservation().getCheckInDate()));
        reservationCell.addElement(new Paragraph("Check-out: " + bill.getReservation().getCheckOutDate()));
        reservationCell.addElement(new Paragraph("Nights: " + bill.getNights()));

        table.addCell(guestCell);
        table.addCell(reservationCell);

        document.add(table);
    }

    
    private void addChargeTable(Document document, Bill bill) throws Exception {
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
        Paragraph sectionTitle = new Paragraph("Charge Breakdown", sectionFont);
        sectionTitle.setSpacingAfter(10);
        document.add(sectionTitle);

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{2, 3, 1, 2, 2});

        addTableHeader(table, "Type");
        addTableHeader(table, "Description");
        addTableHeader(table, "Qty");
        addTableHeader(table, "Unit Price");
        addTableHeader(table, "Total");

        addTableRow(
                table,
                "ROOM",
                bill.getNights() + " night(s)",
                "1",
                bill.getRoomCharge(),
                bill.getRoomCharge()
        );

        List<ServiceCharge> charges = serviceChargeRepository.findByReservationId(bill.getReservation().getId());

        for (ServiceCharge charge : charges) {
            addTableRow(
                    table,
                    charge.getChargeType().toString(),
                    charge.getDescription(),
                    String.valueOf(charge.getQuantity()),
                    charge.getUnitPrice(),
                    charge.getTotalAmount()
            );
        }

        document.add(table);
    }

    private void addTotals(Document document, Bill bill) throws Exception {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(45);
        table.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.setSpacingBefore(20);

        addTotalRow(table, "Room Charge", bill.getRoomCharge());
        addTotalRow(table, "Service Charges", bill.getServiceChargeTotal());
        addTotalRow(table, "Tax", bill.getTaxAmount());
        addTotalRow(table, "Total Charges", bill.getTotalAmount());
        addTotalRow(table, "Advance Paid", bill.getAdvanceAmount());
        addTotalRow(table, "Balance Due", bill.getBalanceAmount());


        addTextRow(table, "Invoice Status", bill.getStatus() == null ? "-" : bill.getStatus().toString());

        addTextRow(
                table,
                "Payment Method",
                bill.getPaymentMethod() == null ? "Not Paid" : bill.getPaymentMethod().toString()
        );

        addTextRow(
                table,
                "Paid At",
                bill.getPaidAt() == null
                        ? "-"
                        : bill.getPaidAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
        );



        document.add(table);
    }

    private void addFooter(Document document) throws Exception {
        Paragraph footer = new Paragraph(
                "Thank you for staying with us.",
                FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 11, Color.DARK_GRAY)
        );
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(30);
        document.add(footer);
    }

    private void addTableHeader(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE)));
        cell.setBackgroundColor(new Color(36, 48, 72));
        cell.setPadding(8);
        table.addCell(cell);
    }

    private void addTableRow(
            PdfPTable table,
            String type,
            String description,
            String quantity,
            BigDecimal unitPrice,
            BigDecimal total
    ) {
        table.addCell(createCell(type));
        table.addCell(createCell(description));
        table.addCell(createCell(quantity));
        table.addCell(createCell(formatMoney(unitPrice)));
        table.addCell(createCell(formatMoney(total)));
    }

    private PdfPCell createCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text));
        cell.setPadding(7);
        return cell;
    }

    private void addTotalRow(PdfPTable table, String label, BigDecimal amount) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
        PdfPCell amountCell = new PdfPCell(new Phrase(formatMoney(amount)));

        labelCell.setPadding(7);
        amountCell.setPadding(7);
        amountCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        table.addCell(labelCell);
        table.addCell(amountCell);
    }

    private void addTextRow(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
        PdfPCell valueCell = new PdfPCell(new Phrase(value));

        labelCell.setPadding(7);
        valueCell.setPadding(7);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }



    private String formatMoney(BigDecimal amount) {
        if (amount == null) {
            amount = BigDecimal.ZERO;
        }

        return "LKR " + amount;
    }

    private String formatInvoiceNumber(Long id) {
        return "INV-" + String.format("%04d", id);
    }

    private String formatReservationNumber(Long id) {
        return "RES-" + String.format("%04d", id);
    }
}