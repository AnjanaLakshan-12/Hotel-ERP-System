import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import StatusBadge from "../../components/StatusBadge";
import StatCard from "../../components/StatCard";
import { getBills } from "../../services/billService";
import {
  approveMaintenanceRequest,
  completeMaintenanceRequest,
  getMaintenanceRequests,
  rejectMaintenanceRequest,
} from "../../services/maintenanceRequestService";

import {
  getReservations,
  processReservationCancellation
} from "../../services/reservationService";

import { formatReservationNumber } from "../../utils/reservationNumber";

function ManagerPanel() {
  const [reservations, setReservations] = useState([]);
  const [bills, setBills] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [managerNotes, setManagerNotes] = useState({});
  const [priorities, setPriorities] = useState({});

  const getLocalToday = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const today = getLocalToday();

  const loadData = async () => {
    const [reservationResponse, billResponse, maintenanceResponse] = await Promise.all([
      getReservations(),
      getBills(),
      getMaintenanceRequests()
    ]);

    setReservations(reservationResponse.data);
    setBills(billResponse.data);
    setMaintenanceRequests(maintenanceResponse.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayArrivals = reservations.filter((reservation) =>
    reservation.checkInDate === today &&
    ["CONFIRMED", "CHECKED_IN"].includes(reservation.status)
  );

  const todayDepartures = reservations.filter((reservation) =>
    reservation.checkOutDate === today &&
    ["CHECKED_IN", "CHECKED_OUT"].includes(reservation.status)
  );

  const inHouseGuests = reservations.filter((reservation) =>
    reservation.status === "CHECKED_IN"
  );

  const pendingPayments = bills.filter((bill) =>
    bill.status === "UNPAID"
  );


  const pendingMaintenanceRequests = maintenanceRequests.filter((request) =>
    request.status === "PENDING"
  );

  const approvedMaintenanceRequests = maintenanceRequests.filter((request) =>
    request.status === "APPROVED"
  );

  const cancellationRequests = reservations.filter((reservation) =>
  reservation.status === "CANCELLATION_REQUESTED"
);

  const handleNoteChange = (requestId, value) => {
    setManagerNotes({
      ...managerNotes,
      [requestId]: value
    });
  };

  const handlePriorityChange = (requestId, value) => {
    setPriorities({
      ...priorities,
      [requestId]: value
    });
  };

  const handleApproveMaintenance = async (request) => {
    setMessage("");

    try {
      await approveMaintenanceRequest(
        request.id,
        managerNotes[request.id] || "",
        priorities[request.id] || "MEDIUM"
      );

      setMessage("Maintenance request approved and room moved to maintenance");
      loadData();
    } catch (err) {
      setMessage(err.response?.data || "Failed to approve maintenance request");
    }
  };

  const handleRejectMaintenance = async (request) => {
    setMessage("");

    try {
      await rejectMaintenanceRequest(
        request.id,
        managerNotes[request.id] || ""
      );

      setMessage("Maintenance request rejected");
      loadData();
    } catch (err) {
      setMessage(err.response?.data || "Failed to reject maintenance request");
    }
  };

  const handleCompleteMaintenance = async (request) => {
    setMessage("");

    try {
      await completeMaintenanceRequest(request.id);
      setMessage("Maintenance completed and room returned to available");
      loadData();
    } catch (err) {
      setMessage(err.response?.data || "Failed to complete maintenance request");
    }
  };


  const handleCancellationDecision = async (reservation, decision) => {
  let partialRefundAmount = null;

  if (decision === "APPROVED_PARTIAL_REFUND") {
    const amount = window.prompt("Enter partial refund amount", "0");

    if (amount === null) {
      return;
    }

    partialRefundAmount = Number(amount);
  }

  setMessage("");

  try {
    await processReservationCancellation(reservation.id, {
      decision,
      partialRefundAmount
    });

    setMessage("Cancellation request reviewed successfully");
    loadData();
  } catch (err) {
    setMessage(err.response?.data || "Failed to process cancellation request");
  }
};
  



  return (
    <AppShell
      title="Manager Panel"
      subtitle="Operational approvals, maintenance control, cancellation decisions, and daily hotel status."
    >
      {message && <div className="alert">{message}</div>}

      <section className="stats-grid">
        <StatCard label="Today's Arrivals" value={todayArrivals.length} tone="info" />
        <StatCard label="Today's Departures" value={todayDepartures.length} tone="gold" />
        <StatCard label="Currently In-House" value={inHouseGuests.length} tone="success" />
        <StatCard label="Pending Payments" value={pendingPayments.length} tone="warning" />
      </section>

      <section className="manager-grid">
        <section className="panel table-panel span-wide">
          <h3>Maintenance Requests</h3>
          <p className="panel-note">
            Requests are submitted by receptionists from Room Management. Managers set priority and approve or reject.
          </p>

          <table>
            <thead>
              <tr>
                <th>Room</th>
                <th>Issue</th>
                <th>Reported By</th>
                <th>Priority</th>
                <th>Manager Note</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingMaintenanceRequests.length === 0 ? (
                <tr>
                  <td colSpan="7">No pending maintenance requests</td>
                </tr>
              ) : (
                pendingMaintenanceRequests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      Room {request.room?.roomNumber}
                      <p className="table-note">Floor {request.room?.floor || "-"}</p>
                    </td>
                    <td>
                      <strong>{request.issueTitle}</strong>
                      <p className="table-note">{request.description}</p>
                    </td>
                    <td>{request.reportedBy}</td>
                    <td>
                      <select
                        value={priorities[request.id] || request.priority || "MEDIUM"}
                        onChange={(event) => handlePriorityChange(request.id, event.target.value)}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </td>
                    <td>
                      <input
                        value={managerNotes[request.id] || ""}
                        onChange={(event) => handleNoteChange(request.id, event.target.value)}
                        placeholder="Manager decision note"
                      />
                    </td>
                    <td><StatusBadge status={request.status} /></td>
                    <td className="table-actions">
                      <button onClick={() => handleApproveMaintenance(request)}>Approve</button>
                      <button className="danger" onClick={() => handleRejectMaintenance(request)}>Reject</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

<section className="panel table-panel">
  <h3>Active Maintenance</h3>
  <p className="panel-note">
    Approved requests stay active until the manager marks the repair as completed.
  </p>

  <table>
    <thead>
      <tr>
        <th>Room</th>
        <th>Issue</th>
        <th>Priority</th>
        <th>Action</th>
      </tr>
    </thead>

    <tbody>
      {approvedMaintenanceRequests.length === 0 ? (
        <tr>
          <td colSpan="4">No active maintenance work</td>
        </tr>
      ) : (
        approvedMaintenanceRequests.map((request) => (
          <tr key={request.id}>
            <td>Room {request.room?.roomNumber}</td>
            <td>{request.issueTitle}</td>
            <td><StatusBadge status={request.priority} /></td>
            <td className="table-actions">
              <button onClick={() => handleCompleteMaintenance(request)}>
                Set Room Available
              </button>

              <button
                type="button"
                onClick={() =>
                  setMessage("Maintenance department report module is not implemented in this prototype")
                }
              >
                Review Maintenance Report
              </button>
            </td>
          </tr>
        ))
      )}
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
  <button onClick={() => handleCancellationDecision(reservation, "APPROVED_FULL_REFUND")}>
    Full Refund
  </button>

  <button onClick={() => handleCancellationDecision(reservation, "APPROVED_PARTIAL_REFUND")}>
    Partial Refund
  </button>

  <button onClick={() => handleCancellationDecision(reservation, "APPROVED_NO_REFUND")}>
    No Refund
  </button>

  <button
    className="danger"
    onClick={() => handleCancellationDecision(reservation, "REJECTED")}
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
      </section>
    </AppShell>
  );
}

export default ManagerPanel;