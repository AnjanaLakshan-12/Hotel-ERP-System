import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import StatCard from "../../components/StatCard";
import { getDashboardSummary } from "../../services/dashboardService";

function OperationsDashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getDashboardSummary().then((response) => setSummary(response.data));
  }, []);

  const data = summary || {
    totalCustomers: 0,
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    totalReservations: 0,
    unpaidBills: 0,
    totalRevenue: 0
  };

  return (
    <AppShell title="Dashboard" subtitle="Real-time overview of hotel operations and revenue.">
      <section className="stats-grid">
        <StatCard label="Customers" value={data.totalCustomers} />
        <StatCard label="Rooms" value={data.totalRooms} />
        <StatCard label="Available Rooms" value={data.availableRooms} tone="success" />
        <StatCard label="Occupied Rooms" value={data.occupiedRooms} tone="info" />
        <StatCard label="Reservations" value={data.totalReservations} />
        <StatCard label="Unpaid Invoices" value={data.unpaidBills} tone="warning" />
        <StatCard label="Paid Revenue" value={`LKR ${Number(data.totalRevenue || 0).toLocaleString()}`} tone="gold" />
      </section>

      <section className="process-panel">
        <div>
          <span>1</span>
          <strong>Customer</strong>
          <p>Guest profile is created.</p>
        </div>
        <div>
          <span>2</span>
          <strong>Room</strong>
          <p>Availability is checked.</p>
        </div>
        <div>
          <span>3</span>
          <strong>Reservation</strong>
          <p>Room becomes occupied.</p>
        </div>
        <div>
          <span>4</span>
          <strong>Invoicing</strong>
          <p>Invoice is generated.</p>
        </div>
      </section>
    </AppShell>
  );
}

export default OperationsDashboard;
