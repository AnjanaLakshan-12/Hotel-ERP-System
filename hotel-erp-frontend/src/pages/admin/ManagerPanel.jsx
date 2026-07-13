import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import StatusBadge from "../../components/StatusBadge";
import StatCard from "../../components/StatCard";
import { getReservations, updateReservationStatus } from "../../services/reservationService";
import { getRooms, updateRoomStatus } from "../../services/roomService";
import { getBills } from "../../services/billService";
import { formatReservationNumber } from "../../utils/reservationNumber";

const staffReports = [
  {
    id: 1,
    submittedBy: "Receptionist",
    title: "Guest requested late checkout",
    description: "Room 205 guest requested checkout extension until 2 PM.",
    priority: "MEDIUM",
    status: "PENDING"
  },
  {
    id: 2,
    submittedBy: "Service Staff",
    title: "Mini bar restock required",
    description: "Room 304 mini bar needs water bottles and soft drinks.",
    priority: "LOW",
    status: "OPEN"
  },
  {
    id: 3,
    submittedBy: "Service Staff",
    title: "Bathroom maintenance issue",
    description: "Room 108 has a leaking tap reported during cleaning.",
    priority: "HIGH",
    status: "PENDING"
  }
];

function ManagerPanel() {
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bills, setBills] = useState([]);
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const loadData = async () => {
    const [reservationResponse, roomResponse, billResponse] = await Promise.all([
      getReservations(),
      getRooms(),
      getBills()
    ]);

    setReservations(reservationResponse.data);
    setRooms(roomResponse.data);
    setBills(billResponse.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayArrivals = reservations.filter((reservation) =>
    reservation.checkInDate === today && reservation.status === "CONFIRMED"
  );

  const todayDepartures = reservations.filter((reservation) =>
    reservation.checkOutDate === today && reservation.status === "CHECKED_IN"
  );

  const inHouseGuests = reservations.filter((reservation) =>
    reservation.status === "CHECKED_IN"
  );

  const pendingPayments = bills.filter((bill) =>
    bill.status === "UNPAID"
  );

  const cancellationRequests = reservations.filter((reservation) =>
    reservation.status === "PENDING_CANCEL"
  );

  const handleCancellationDecision = async (reservationId, decision) => {
    setMessage("");

    try {
      if (decision === "APPROVE") {
        await updateReservationStatus(reservationId, "CANCELLED");
        setMessage("Cancellation request approved");
      } else {
        await updateReservationStatus(reservationId, "CONFIRMED");
        setMessage("Cancellation request rejected");
      }

      loadData();
    } catch (err) {
      setMessage(err.response?.data || "Failed to update cancellation request");
    }
  };

  const handleMaintenanceRequest = async (roomId) => {
    setMessage("");

    try {
      await updateRoomStatus(roomId, "MAINTENANCE");
      setMessage("Room marked for maintenance");
      loadData();
    } catch (err) {
      setMessage(err.response?.data || "Failed to request maintenance");
    }
  };

  return (
    <AppShell
      title="Manager Panel"
      subtitle="Operational approvals, staff reports, maintenance requests, and daily hotel status."
    >
      {message && <div className="alert">{message}</div>}

      <section className="stats-grid">
        <StatCard label="Today's Arrivals" value={todayArrivals.length} tone="info" />
        <StatCard label="Today's Departures" value={todayDepartures.length} tone="gold" />
        <StatCard label="Currently In-House" value={inHouseGuests.length} tone="success" />
        <StatCard label="Pending Payments" value={pendingPayments.length} tone="warning" />
      </section>

      <section className="manager-grid">
        <section className="panel table-panel">
          <h3>Staff Reports</h3>
          <p className="panel-note">
            Reports submitted by receptionists and service staff. This is a prototype view until backend report submission is added.
          </p>

          <table>
            <thead>
              <tr>
                <th>Submitted By</th>
                <th>Report</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {staffReports.map((report) => (
                <tr key={report.id}>
                  <td>{report.submittedBy}</td>
                  <td>
                    <strong>{report.title}</strong>
                    <p className="table-note">{report.description}</p>
                  </td>
                  <td><StatusBadge status={report.priority} /></td>
                  <td><StatusBadge status={report.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel table-panel">
          <h3>Reservation Cancellation Requests</h3>
          <p className="panel-note">
            Managers can approve or reject cancellation requests submitted by reception.
          </p>

          <table>
            <thead>
              <tr>
                <th>Reservation</th>
                <th>Guest</th>
                <th>Stay</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cancellationRequests.length === 0 ? (
                <tr>
                  <td colSpan="4">No pending cancellation requests</td>
                </tr>
              ) : (
                cancellationRequests.map((reservation) => (
                  <tr key={reservation.id}>
                    <td>{formatReservationNumber(reservation.id)}</td>
                    <td>
                      {reservation.customer?.firstName} {reservation.customer?.lastName}
                    </td>
                    <td>{reservation.checkInDate} to {reservation.checkOutDate}</td>
                    <td className="table-actions">
                      <button onClick={() => handleCancellationDecision(reservation.id, "APPROVE")}>
                        Approve
                      </button>
                      <button
                        className="danger"
                        onClick={() => handleCancellationDecision(reservation.id, "REJECT")}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="panel table-panel span-wide">
          <h3>Room Maintenance Requests</h3>
          <p className="panel-note">
            Managers can move rooms into maintenance when service staff report a room issue.
          </p>

          <table>
            <thead>
              <tr>
                <th>Room</th>
                <th>Type</th>
                <th>Floor</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.roomNumber}</td>
                  <td>{room.roomType}</td>
                  <td>Floor {room.floor || "-"}</td>
                  <td><StatusBadge status={room.status} /></td>
                  <td className="table-actions">
                    <button
                      onClick={() => handleMaintenanceRequest(room.id)}
                      disabled={room.status === "MAINTENANCE"}
                    >
                      Request Maintenance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </section>
    </AppShell>
  );
}

export default ManagerPanel;