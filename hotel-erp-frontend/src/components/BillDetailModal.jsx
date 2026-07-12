import { formatInvoiceNumber } from "../utils/invoiceNumber";
import { formatPaymentMethod } from "../utils/paymentMethod";
import { formatReservationNumber } from "../utils/reservationNumber";

function BillDetailModal({ bill, onClose, onDownload }) {
  if (!bill) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        <header>
          <h3>{formatInvoiceNumber(bill.id)}</h3>
          <div className="table-actions">
            <button onClick={() => onDownload(bill)}>Download PDF</button>
            <button onClick={onClose}>Close</button>
          </div>
        </header>
        <dl className="detail-list">
          <dt>Reservation</dt>
          <dd>{formatReservationNumber(bill.reservation?.id)}</dd>
          <dt>Nights</dt>
          <dd>{bill.nights}</dd>
          <dt>Room Charge</dt>
          <dd>LKR {Number(bill.roomCharge || 0).toLocaleString()}</dd>
          <dt>Service Charges</dt>
          <dd>LKR {Number(bill.serviceChargeTotal || 0).toLocaleString()}</dd>
          <dt>Tax</dt>
          <dd>LKR {Number(bill.taxAmount || 0).toLocaleString()}</dd>
          <dt>Total</dt>
          <dd>LKR {Number(bill.totalAmount || 0).toLocaleString()}</dd>
          <dt>Advance Paid</dt>
          <dd>LKR {Number(bill.advanceAmount || 0).toLocaleString()}</dd>
          <dt>Balance Due</dt>
          <dd>LKR {Number(bill.balanceAmount || 0).toLocaleString()}</dd>
          <dt>Payment Method</dt>
          <dd>{formatPaymentMethod(bill.paymentMethod)}</dd>
          <dt>Status</dt>
          <dd>{bill.status}</dd>
        </dl>
      </div>
    </div>
  );
}

export default BillDetailModal;
