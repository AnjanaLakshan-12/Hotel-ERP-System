import { formatReservationNumber } from "../utils/reservationNumber";

function FolioPreviewModal({ folio, onClose }) {
  if (!folio) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        <header>
          <h3>Interim Folio {formatReservationNumber(folio.reservationId)}</h3>
          <button onClick={onClose}>Close</button>
        </header>
        <dl className="detail-list">
          <dt>Status</dt>
          <dd>{folio.status}</dd>
          <dt>Nights</dt>
          <dd>{folio.nights}</dd>
          <dt>Room Charge</dt>
          <dd>LKR {Number(folio.roomCharge || 0).toLocaleString()}</dd>
          <dt>Service Charges</dt>
          <dd>LKR {Number(folio.serviceChargeTotal || 0).toLocaleString()}</dd>
          <dt>Tax</dt>
          <dd>LKR {Number(folio.taxAmount || 0).toLocaleString()}</dd>
          <dt>Total Charges</dt>
          <dd>LKR {Number(folio.totalAmount || 0).toLocaleString()}</dd>
          <dt>Advance Paid</dt>
          <dd>LKR {Number(folio.advanceAmount || 0).toLocaleString()}</dd>
          <dt>Balance Due</dt>
          <dd>LKR {Number(folio.balanceAmount || 0).toLocaleString()}</dd>
        </dl>
      </div>
    </div>
  );
}

export default FolioPreviewModal;
