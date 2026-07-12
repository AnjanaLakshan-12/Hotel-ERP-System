import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import ReservationDetailModal from "../../components/ReservationDetailModal";
import StatusBadge from "../../components/StatusBadge";
import { getCustomers } from "../../services/customerService";
import { getRooms } from "../../services/roomService";
import {
  createReservation,
  earlyCheckout,
  getReservations,
  updateReservationStatus
} from "../../services/reservationService";
import { formatPaymentMethod, paymentMethods } from "../../utils/paymentMethod";
import { formatReservationNumber } from "../../utils/reservationNumber";

const emptyReservation = {
  customerId: "",
  roomId: "",
  checkInDate: "",
  checkOutDate: "",
  advanceAmount: "",
  advancePaymentMethod: "CASH"
};

function ReservationManagement() {
  const [reservations, setReservations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(emptyReservation);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    const [reservationResponse, customerResponse, roomResponse] = await Promise.all([
      getReservations(),
      getCustomers(),
      getRooms()
    ]);
    setReservations(reservationResponse.data);
    setCustomers(customerResponse.data);
    setRooms(roomResponse.data);
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
      await createReservation({
        ...form,
        customerId: Number(form.customerId),
        roomId: Number(form.roomId),
        advanceAmount: Number(form.advanceAmount || 0),
        advancePaymentMethod: Number(form.advanceAmount || 0) > 0 ? form.advancePaymentMethod : null
      });
      setForm(emptyReservation);
      setMessage("Reservation created and room status updated");
      loadData();
    } catch (err) {
      setMessage(err.response?.data || "Reservation failed");
    }
  };

  const handleStatus = async (id, status) => {
    await updateReservationStatus(id, status);
    loadData();
  };

  const handleEarlyCheckout = async (reservation) => {
    const actualCheckoutDate = window.prompt(
      "Enter actual checkout date (YYYY-MM-DD)",
      reservation.checkOutDate
    );

    if (!actualCheckoutDate) {
      return;
    }

    setMessage("");
    try {
      await earlyCheckout(reservation.id, actualCheckoutDate);
      setMessage("Early checkout completed. Room released and unpaid bill adjusted.");
      loadData();
    } catch (err) {
      setMessage(err.response?.data || "Early checkout failed");
    }
  };

  return (
    <AppShell title="Reservation Management" subtitle="Book rooms and manage guest stay status.">
      <section className="management-grid">
        <form className="panel form-grid two" onSubmit={handleSubmit}>
          <h3 className="span-two">Create Reservation</h3>
          {message && <div className="alert span-two">{message}</div>}
          <label>
            Customer
            <select name="customerId" value={form.customerId} onChange={handleChange} required>
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.firstName} {customer.lastName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Room
            <select name="roomId" value={form.roomId} onChange={handleChange} required>
              <option value="">Select available room</option>
              {rooms.filter((room) => room.status === "AVAILABLE").map((room) => (
                <option key={room.id} value={room.id}>
                  {room.roomNumber} - {room.roomType} - Floor {room.floor || "-"} - LKR {Number(room.pricePerNight).toLocaleString()}
                </option>
              ))}
            </select>
          </label>
          <label>
            Check-in Date
            <input name="checkInDate" type="date" value={form.checkInDate} onChange={handleChange} required />
          </label>
          <label>
            Check-out Date
            <input name="checkOutDate" type="date" value={form.checkOutDate} onChange={handleChange} required />
          </label>
          <label className="span-two">
            Advance Amount
            <input
              name="advanceAmount"
              type="number"
              min="0"
              value={form.advanceAmount}
              onChange={handleChange}
              placeholder="Optional deposit paid at booking"
            />
          </label>
          <label className="span-two">
            Advance Payment Method
            <select name="advancePaymentMethod" value={form.advancePaymentMethod} onChange={handleChange}>
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </label>
          <button className="primary-button span-two" type="submit">Create Reservation</button>
        </form>

        <section className="panel table-panel">
          <h3>Reservations</h3>
          <table>
            <thead>
              <tr>
                <th>Reservation No</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Advance</th>
                <th>Payment</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>{formatReservationNumber(reservation.id)}</td>
                  <td>{reservation.customer?.firstName} {reservation.customer?.lastName}</td>
                  <td>{reservation.room?.roomNumber} - Floor {reservation.room?.floor || "-"}</td>
                  <td>LKR {Number(reservation.advanceAmount || 0).toLocaleString()}</td>
                  <td>{formatPaymentMethod(reservation.advancePaymentMethod)}</td>
                  <td>{reservation.checkInDate} to {reservation.checkOutDate}</td>
                  <td><StatusBadge status={reservation.status} /></td>
                  <td className="table-actions">
                    <button onClick={() => setSelected(reservation)}>View</button>
                    <button onClick={() => handleStatus(reservation.id, "CHECKED_IN")}>Check In</button>
                    <button onClick={() => handleStatus(reservation.id, "CHECKED_OUT")}>Check Out</button>
                    <button onClick={() => handleEarlyCheckout(reservation)}>Early Checkout</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </section>
      <ReservationDetailModal reservation={selected} onClose={() => setSelected(null)} />
    </AppShell>
  );
}

export default ReservationManagement;
