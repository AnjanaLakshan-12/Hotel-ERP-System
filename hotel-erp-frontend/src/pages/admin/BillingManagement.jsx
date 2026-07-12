import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import BillDetailModal from "../../components/BillDetailModal";
import FolioPreviewModal from "../../components/FolioPreviewModal";
import StatusBadge from "../../components/StatusBadge";
import {
  downloadInvoicePdf,
  generateBill,
  getBills,
  getFolioPreview,
  updateBillStatus
} from "../../services/billService";
import { getReservations } from "../../services/reservationService";
import { formatInvoiceNumber } from "../../utils/invoiceNumber";
import { formatPaymentMethod, paymentMethods } from "../../utils/paymentMethod";
import { formatReservationNumber } from "../../utils/reservationNumber";

const getErrorMessage = (err, fallback) => {
  const data = err.response?.data;

  if (!data) {
    return fallback;
  }
  if (typeof data === "string") {
    return data;
  }
  if (data.message) {
    return data.message;
  }
  if (data.error) {
    return data.error;
  }

  return fallback;
};

function BillingManagement() {
  const [bills, setBills] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [reservationId, setReservationId] = useState("");
  const [folioReservationId, setFolioReservationId] = useState("");
  const [selected, setSelected] = useState(null);
  const [folio, setFolio] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState({});

  const loadData = async () => {
    const [billResponse, reservationResponse] = await Promise.all([
      getBills(),
      getReservations()
    ]);
    setBills(billResponse.data);
    setReservations(reservationResponse.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await generateBill(reservationId);
      setReservationId("");
      setMessage("Invoice generated successfully");
      loadData();
    } catch (err) {
      setMessage(getErrorMessage(err, "Invoice generation failed"));
    }
  };

  const handlePaymentMethodChange = (billId, paymentMethod) => {
    setSelectedPaymentMethods((current) => ({
      ...current,
      [billId]: paymentMethod
    }));
  };

  const handleStatus = async (bill, status) => {
    let paymentMethod = "";

    if (status === "PAID") {
      paymentMethod = selectedPaymentMethods[bill.id] || bill.paymentMethod || "CASH";

      if (!["CASH", "CARD", "ONLINE_TRANSFER"].includes(paymentMethod)) {
        setMessage("Payment method must be CASH, CARD, or ONLINE_TRANSFER");
        return;
      }
    }

    await updateBillStatus(bill.id, status, paymentMethod);
    loadData();
  };

  const handleDownloadInvoice = async (bill) => {
    setMessage("");

    try {
      const response = await downloadInvoicePdf(bill.id);
      const fileUrl = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");

      link.href = fileUrl;
      link.download = `${formatInvoiceNumber(bill.id)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(fileUrl);
    } catch (err) {
      setMessage(getErrorMessage(err, "Invoice PDF is not available yet"));
    }
  };

  const handlePreviewFolio = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const response = await getFolioPreview(folioReservationId);
      setFolio(response.data);
    } catch (err) {
      setMessage(getErrorMessage(err, "Folio preview failed"));
    }
  };

  const unbilledReservations = reservations.filter((reservation) =>
    !bills.some((bill) => bill.reservation?.id === reservation.id)
  );

  const activeFolioReservations = reservations.filter((reservation) =>
    reservation.status === "CHECKED_IN" || reservation.status === "CHECKED_OUT"
  );

  const finalInvoiceReservations = unbilledReservations.filter((reservation) =>
    reservation.status === "CHECKED_OUT"
  );

  return (
    <AppShell
      title="Invoice Management"
      subtitle="Preview active guest folios during the stay and finalize invoices at checkout."
    >
      <section className="management-grid">
        <form className="panel form-grid" onSubmit={handlePreviewFolio}>
          <h3>Interim Folio Preview</h3>
          <p className="panel-note">
            View the live folio before final invoice generation. This does not save an invoice.
          </p>
          {message && <div className="alert">{message}</div>}
          <label>
            Reservation
            <select
              value={folioReservationId}
              onChange={(event) => setFolioReservationId(event.target.value)}
              required
            >
              <option value="">Select checked-in or checked-out reservation</option>
              {activeFolioReservations.map((reservation) => (
                <option key={reservation.id} value={reservation.id}>
                  {formatReservationNumber(reservation.id)} - {reservation.customer?.firstName} {reservation.customer?.lastName} - {reservation.status}
                </option>
              ))}
            </select>
          </label>
          <button className="secondary-button" type="submit">View Folio</button>
        </form>

        <form className="panel form-grid" onSubmit={handleGenerate}>
          <h3>Finalize Invoice</h3>
          <p className="panel-note">
            Official invoices can be generated only after guest checkout.
          </p>
          <label>
            Reservation
            <select value={reservationId} onChange={(event) => setReservationId(event.target.value)} required>
              <option value="">Select checked-out reservation</option>
              {finalInvoiceReservations
                .map((reservation) => (
                  <option key={reservation.id} value={reservation.id}>
                    {formatReservationNumber(reservation.id)} - {reservation.customer?.firstName} {reservation.customer?.lastName} - Room {reservation.room?.roomNumber}
                  </option>
                ))}
            </select>
          </label>
          <button className="primary-button" type="submit">Generate Final Invoice</button>
        </form>

        <section className="panel table-panel span-wide">
          <h3>Invoices</h3>
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Reservation</th>
                <th>Services</th>
                <th>Total</th>
                <th>Balance Due</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.id}>
                  <td>{formatInvoiceNumber(bill.id)}</td>
                  <td>{formatReservationNumber(bill.reservation?.id)}</td>
                  <td>LKR {Number(bill.serviceChargeTotal || 0).toLocaleString()}</td>
                  <td>LKR {Number(bill.totalAmount || 0).toLocaleString()}</td>
                  <td>LKR {Number(bill.balanceAmount ?? bill.totalAmount ?? 0).toLocaleString()}</td>
                  <td>{formatPaymentMethod(bill.paymentMethod)}</td>
                  <td><StatusBadge status={bill.status} /></td>
                  <td className="table-actions">
                    <button onClick={() => setSelected(bill)}>View</button>
                    <button onClick={() => handleDownloadInvoice(bill)}>Download PDF</button>
                    <select
                      className="payment-select"
                      value={selectedPaymentMethods[bill.id] || bill.paymentMethod || "CASH"}
                      onChange={(event) => handlePaymentMethodChange(bill.id, event.target.value)}
                      disabled={bill.status === "PAID"}
                    >
                      {paymentMethods.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => handleStatus(bill, "PAID")} disabled={bill.status === "PAID"}>Mark Paid</button>
                    <button className="danger" onClick={() => handleStatus(bill, "CANCELLED")}>Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </section>
      <BillDetailModal bill={selected} onClose={() => setSelected(null)} onDownload={handleDownloadInvoice} />
      <FolioPreviewModal folio={folio} onClose={() => setFolio(null)} />
    </AppShell>
  );
}

export default BillingManagement;
