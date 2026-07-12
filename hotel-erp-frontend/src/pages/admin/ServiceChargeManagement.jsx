import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import StatusBadge from "../../components/StatusBadge";
import { getReservations } from "../../services/reservationService";
import {
  addServiceCharge,
  getServiceCharges,
  getServiceChargesByReservation
} from "../../services/serviceChargeService";
import { formatReservationNumber } from "../../utils/reservationNumber";

const emptyCharge = {
  reservationId: "",
  chargeType: "FOOD",
  description: "",
  unitPrice: "",
  quantity: 1
};

function ServiceChargeManagement() {
  const [reservations, setReservations] = useState([]);
  const [charges, setCharges] = useState([]);
  const [selectedReservationId, setSelectedReservationId] = useState("");
  const [form, setForm] = useState(emptyCharge);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    const [reservationResponse, chargeResponse] = await Promise.all([
      getReservations(),
      getServiceCharges()
    ]);
    setReservations(reservationResponse.data);
    setCharges(chargeResponse.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      await addServiceCharge({
        ...form,
        reservationId: Number(form.reservationId),
        unitPrice: Number(form.unitPrice),
        quantity: Number(form.quantity)
      });
      setMessage("Service charge added to guest folio");
      setSelectedReservationId(form.reservationId);
      setForm({ ...emptyCharge, reservationId: form.reservationId });
      loadData();
    } catch (err) {
      setMessage(err.response?.data || "Failed to add service charge");
    }
  };

  const handleFilter = async (reservationId) => {
    setSelectedReservationId(reservationId);
    if (!reservationId) {
      const response = await getServiceCharges();
      setCharges(response.data);
      return;
    }

    const response = await getServiceChargesByReservation(reservationId);
    setCharges(response.data);
  };

  const selectedTotal = charges
    .filter((charge) => !selectedReservationId || String(charge.reservation?.id) === String(selectedReservationId))
    .reduce((sum, charge) => sum + Number(charge.totalAmount || 0), 0);

  return (
    <AppShell
      title="Service Charges"
      subtitle="Record food, beverages, laundry, room service, and other guest folio charges."
    >
      <section className="stats-grid compact">
        <article className="stat-card tone-gold">
          <span>Visible Folio Charges</span>
          <strong>{charges.length}</strong>
        </article>
        <article className="stat-card tone-info">
          <span>Charge Total</span>
          <strong>LKR {selectedTotal.toLocaleString()}</strong>
        </article>
      </section>

      <section className="management-grid">
        <form className="panel form-grid two" onSubmit={handleSubmit}>
          <h3 className="span-two">Add Folio Charge</h3>
          {message && <div className="alert span-two">{message}</div>}
          
          
          
          <label className="span-two">
            Reservation
            <select name="reservationId" value={form.reservationId} onChange={handleChange} required>
              <option value="">Select checked-in reservation</option>
              {reservations
                .filter((reservation) => reservation.status === "CHECKED_IN")
                .map((reservation) => (
                  <option key={reservation.id} value={reservation.id}>
                    {formatReservationNumber(reservation.id)} - {reservation.customer?.firstName} {reservation.customer?.lastName} - Room {reservation.room?.roomNumber}
                  </option>
                ))}
            </select>
            </label>

          

          <label>
            Charge Type
            <select name="chargeType" value={form.chargeType} onChange={handleChange}>
              <option value="ROOM_SERVICE">Room Service</option>
              <option value="FOOD">Food</option>
              <option value="BEVERAGE">Beverage</option>
              <option value="LAUNDRY">Laundry</option>
              <option value="MINIBAR">Mini Bar</option>
              <option value="EXTRA_BED">Extra Bed</option>
              <option value="OTHER">Other</option>
            </select>
          </label>

          <label>
            Description
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Dinner buffet, water bottles, laundry"
              required
            />
          </label>

          <label>
            Unit Price
            <input
              name="unitPrice"
              type="number"
              min="0"
              value={form.unitPrice}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Quantity
            <input
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              required
            />
          </label>

          <button className="primary-button span-two" type="submit">Add Charge</button>
        </form>

        <section className="panel table-panel">
          <div className="panel-toolbar">
            <h3>Guest Folio Charges</h3>
            <select value={selectedReservationId} onChange={(event) => handleFilter(event.target.value)}>
              <option value="">All reservations</option>
              {reservations.map((reservation) => (
                <option key={reservation.id} value={reservation.id}>
                  {formatReservationNumber(reservation.id)}
                </option>
              ))}
            </select>
          </div>

          <table>
            <thead>
              <tr>
                <th>Reservation</th>
                <th>Guest</th>
                <th>Type</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {charges.map((charge) => (
                <tr key={charge.id}>
                  <td>{formatReservationNumber(charge.reservation?.id)}</td>
                  <td>
                    {charge.reservation?.customer?.firstName} {charge.reservation?.customer?.lastName}
                  </td>
                  <td><StatusBadge status={charge.chargeType} /></td>
                  <td>{charge.description}</td>
                  <td>{charge.quantity}</td>
                  <td>LKR {Number(charge.totalAmount || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </section>
    </AppShell>
  );
}

export default ServiceChargeManagement;
