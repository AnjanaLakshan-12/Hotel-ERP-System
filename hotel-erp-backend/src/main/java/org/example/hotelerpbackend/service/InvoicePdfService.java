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
import java.io.File;
import java.io.FileOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;


@Service
public class InvoicePdfService {
      private final ServiceChargeRepository serviceChargeRepository;

    public InvoicePdfService(ServiceChargeRepository serviceChargeRepository) {
        this.serviceChargeRepository = serviceChargeRepository;
    }

    public String generateInvoicePdf(Bill bill) {
        try {
            String folderPath = "invoices";
            File folder = new File(folderPath);

            if (!folder.exists()) {
                folder.mkdirs();
            }

            String invoiceNumber = formatInvoiceNumber(bill.getId());
            String filePath = folderPath + "/" + invoiceNumber + ".pdf";

            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, new FileOutputStream(filePath));
            document.open();

            addHeader(document, invoiceNumber);
            addGuestAndReservationDetails(document, bill);
            addChargeTable(document, bill);
            addTotals(document, bill);
            addFooter(document);

            document.close();

            return filePath;
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
}