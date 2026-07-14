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
  requestReservationCancellation,
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

function ReservationManagement() {
  const [reservations, setReservations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(emptyReservation);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");

  const [reservationSearch, setReservationSearch] = useState("");
  const [reservationStatusFilter, setReservationStatusFilter] = useState("ALL");
  const [reservationPaymentFilter, setReservationPaymentFilter] = useState("ALL");

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
      setMessage(getErrorMessage(err, "Reservation failed"));
    }
  };

  const handleCancellationRequest = async (reservation) => {
    const cancellationReason = window.prompt(
      "Enter cancellation reason",
      "Guest requested cancellation"
    );

    if (!cancellationReason) {
      return;
    }

    setMessage("");

    try {
      await requestReservationCancellation(reservation.id, {
        cancellationReason
      });

      setMessage("Cancellation request sent to manager for review");
      loadData();
    } catch (err) {
      setMessage(getErrorMessage(err, "Failed to send cancellation request"));
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
      setMessage(getErrorMessage(err, "Early checkout failed"));
    }
  };

  const filteredReservations = reservations.filter((reservation) => {
    const reservationNo = formatReservationNumber(reservation.id);
    const guestName = `${reservation.customer?.firstName || ""} ${reservation.customer?.lastName || ""}`;
    const roomNumber = reservation.room?.roomNumber || "";

    const matchesSearch =
      reservationNo.toLowerCase().includes(reservationSearch.toLowerCase()) ||
      guestName.toLowerCase().includes(reservationSearch.toLowerCase()) ||
      String(roomNumber).toLowerCase().includes(reservationSearch.toLowerCase());

    const matchesStatus =
      reservationStatusFilter === "ALL" || reservation.status === reservationStatusFilter;

    const matchesPayment =
      reservationPaymentFilter === "ALL" ||
      reservation.advancePaymentMethod === reservationPaymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

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
              {rooms
                .filter((room) => room.status === "AVAILABLE")
                .map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.roomNumber} - {room.roomType} - Floor {room.floor || "-"} - LKR{" "}
                    {Number(room.pricePerNight || 0).toLocaleString()}
                  </option>
                ))}
            </select>
          </label>

          <label>
            Check-in Date
            <input
              name="checkInDate"
              type="date"
              value={form.checkInDate}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Check-out Date
            <input
              name="checkOutDate"
              type="date"
              value={form.checkOutDate}
              onChange={handleChange}
              required
            />
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

          <button className="primary-button span-two" type="submit">
            Create Reservation
          </button>
        </form>

        <section className="panel table-panel">
          <h3>Reservations</h3>

          <div className="table-filters">
            <input
              placeholder="Search reservation, guest, or room"
              value={reservationSearch}
              onChange={(event) => setReservationSearch(event.target.value)}
            />

            <select
              value={reservationStatusFilter}
              onChange={(event) => setReservationStatusFilter(event.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="CHECKED_OUT">Checked Out</option>
              <option value="CANCELLATION_REQUESTED">Cancellation Requested</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={reservationPaymentFilter}
              onChange={(event) => setReservationPaymentFilter(event.target.value)}
            >
              <option value="ALL">All Payments</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="ONLINE_TRANSFER">Online Transfer</option>
            </select>
          </div>

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
                <th>Refund</th>
                <th>Cancellation</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>{formatReservationNumber(reservation.id)}</td>
                  <td>
                    {reservation.customer?.firstName} {reservation.customer?.lastName}
                  </td>
                  <td>
                    {reservation.room?.roomNumber} - Floor {reservation.room?.floor || "-"}
                  </td>
                  <td>LKR {Number(reservation.advanceAmount || 0).toLocaleString()}</td>
                  <td>{formatPaymentMethod(reservation.advancePaymentMethod)}</td>
                  <td>
                    {reservation.checkInDate} to {reservation.checkOutDate}
                  </td>
                  <td>
                    <StatusBadge status={reservation.status} />
                  </td>

                  <td>
                    {reservation.status === "CANCELLATION_REQUESTED" && "Waiting manager review"}

                    {reservation.status === "CANCELLED" &&
                      (reservation.advanceRefunded
                        ? `Refunded LKR ${Number(reservation.refundedAmount || 0).toLocaleString()}`
                        : "Not refunded")}

                    {reservation.status !== "CANCELLATION_REQUESTED" &&
                      reservation.status !== "CANCELLED" &&
                      "-"}
                  </td>

                  <td>
                    {reservation.status === "CANCELLATION_REQUESTED" || reservation.status === "CANCELLED"
                      ? reservation.cancellationReason || "-"
                      : "-"}
                  </td>

                  <td className="table-actions">
                    <button type="button" onClick={() => setSelected(reservation)}>
                      View
                    </button>

                    {reservation.status === "CONFIRMED" && (
                      <>
                        <button type="button" onClick={() => handleStatus(reservation.id, "CHECKED_IN")}>
                          Check In
                        </button>

                        <button
                          type="button"
                          className="danger"
                          onClick={() => handleCancellationRequest(reservation)}
                        >
                          Request Cancel
                        </button>
                      </>
                    )}

                    {reservation.status === "CHECKED_IN" && (
                      <>
                        <button type="button" onClick={() => handleStatus(reservation.id, "CHECKED_OUT")}>
                          Check Out
                        </button>

                        <button type="button" onClick={() => handleEarlyCheckout(reservation)}>
                          Early Checkout
                        </button>
                      </>
                    )}
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