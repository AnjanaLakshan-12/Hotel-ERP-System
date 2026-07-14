import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import StatCard from "../../components/StatCard";
import { getDashboardSummary } from "../../services/dashboardService";

function OperationsDashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = await getDashboardSummary();
        setSummary(response.data || {});
      } catch (err) {
        setSummary({});
      }
    };

    loadSummary();
  }, []);

  const data = summary || {};

  return (
    <AppShell title="Dashboard" subtitle="Real-time overview of hotel operations.">
      <section className="dashboard-section">
        <div className="section-heading">
          <h3>Customer Flow</h3>
          <p>Daily guest movement and active stays.</p>
        </div>

        <div className="stats-grid">
          <StatCard label="Arrivals Today" value={data.customersArrivingToday || 0} />
          <StatCard label="Confirmed Reservations" value={data.confirmedReservations || 0} />
          <StatCard label="Customers In-House" value={data.customersInHouse || 0} />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h3>Room Status</h3>
          <p>Current room availability across the hotel.</p>
        </div>

        <div className="stats-grid">
          <StatCard label="Total Rooms" value={data.totalRooms || 0} />
          <StatCard label="Available Rooms" value={data.availableRooms || 0} />
          <StatCard label="Occupied Rooms" value={data.occupiedRooms || 0} />
          <StatCard label="Maintenance Rooms" value={data.maintenanceRooms || 0} />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h3>Reservations</h3>
          <p>Reservation status summary for operational tracking.</p>
        </div>

        <div className="stats-grid">
          <StatCard label="Reservations Today" value={data.reservationsToday || 0} />
          <StatCard label="Checked In" value={data.checkedInReservations || 0} />
          <StatCard label="Checked Out" value={data.checkedOutReservations || 0} />
          <StatCard label="Cancelled" value={data.cancelledReservations || 0} />
          <StatCard label="Cancellation Requests" value={data.pendingCancellationRequests || 0} />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h3>Invoices</h3>
          <p>Payment status and confirmed paid revenue.</p>
        </div>

        <div className="stats-grid">
          <StatCard label="Paid Invoices" value={data.paidInvoices || 0} />
          <StatCard label="Unpaid Invoices" value={data.unpaidInvoices || 0} />
          <StatCard
            label="Paid Revenue"
            value={`LKR ${Number(data.paidRevenue || 0).toLocaleString()}`}
          />
        </div>
      </section>
    </AppShell>
  );
}

export default OperationsDashboard;
