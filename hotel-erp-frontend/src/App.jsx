import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CustomerManagement from "./pages/admin/CustomerManagement";
import RoomManagement from "./pages/admin/RoomManagement";
import ReservationManagement from "./pages/admin/ReservationManagement";
import BillingManagement from "./pages/admin/BillingManagement";
import ServiceChargeManagement from "./pages/admin/ServiceChargeManagement";
import ManagerPanel  from "./pages/admin/ManagerPanel";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/customers" element={<CustomerManagement />} />
        <Route path="/admin/rooms" element={<RoomManagement />} />
        <Route path="/admin/reservations" element={<ReservationManagement />} />
        <Route path="/admin/service-charges" element={<ServiceChargeManagement />} />
        <Route path="/admin/billing" element={<BillingManagement />} />
        <Route path="/admin/manager" element={<ManagerPanel />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
