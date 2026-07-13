import { formatPaymentMethod } from "../utils/paymentMethod";
import { formatReservationNumber } from "../utils/reservationNumber";

function ReservationDetailModal({ reservation, onClose }) {
  if (!reservation) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        <header>
          <h3>{formatReservationNumber(reservation.id)}</h3>
          <button onClick={onClose}>Close</button>
        </header>
        <dl className="detail-list">
          <dt>Guest</dt>
          <dd>{reservation.customer?.firstName} {reservation.customer?.lastName}</dd>
          <dt>Room</dt>
          <dd>{reservation.room?.roomNumber} - {reservation.room?.roomType} - Floor {reservation.room?.floor || "-"}</dd>
          <dt>Advance Paid</dt>
          <dd>LKR {Number(reservation.advanceAmount || 0).toLocaleString()}</dd>
          <dt>Advance Payment Method</dt>
          <dd>{formatPaymentMethod(reservation.advancePaymentMethod)}</dd>
          <dt>Stay</dt>
          <dd>{reservation.checkInDate} to {reservation.checkOutDate}</dd>
          <dt>Status</dt>
          <dd>{reservation.status}</dd>
          {reservation.status === "CANCELLED" && (
  <>
    <dt>Cancellation Reason</dt>
    <dd>{reservation.cancellationReason || "-"}</dd>

    <dt>Advance Refunded</dt>
    <dd>{reservation.advanceRefunded ? "Yes" : "No"}</dd>

    <dt>Refunded Amount</dt>
    <dd>LKR {Number(reservation.refundedAmount || 0).toLocaleString()}</dd>
  </>
)}
        </dl>
      </div>
    </div>
  );
}

export default ReservationDetailModal;
