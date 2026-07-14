import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import { createRoom, deleteRoom, getRooms, updateRoom, updateRoomStatus } from "../../services/roomService";
import {
  activateUser,
  createUser,
  deactivateUser,
  deleteUser,
  getRecentUsers,
  getUserStats,
  getUsers,
  updateUser
} from "../../services/userService";

const emptyUser = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "RECEPTIONIST",
  active: true
};

const emptyRoom = {
  roomNumber: "",
  roomType: "Standard",
  pricePerNight: "",
  floor: "",
  status: "AVAILABLE"
};

const roleOptions = ["ADMIN", "MANAGER", "RECEPTIONIST", "SERVICE_STAFF"];

const roleAccess = [
  {
    role: "ADMIN",
    access: "Full system access including users, rooms, reservations, invoices, and manager controls."
  },
  {
    role: "MANAGER",
    access: "Manager panel, rooms, reports, maintenance decisions, and cancellation approvals."
  },
  {
    role: "RECEPTIONIST",
    access: "Customers, reservations, service charges, invoices, and maintenance reports."
  },
  {
    role: "SERVICE_STAFF",
    access: "Service charges and maintenance reporting."
  }
];

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

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    deactivatedUsers: 0,
    admins: 0,
    managers: 0,
    receptionists: 0,
    serviceStaff: 0
  });

  const [form, setForm] = useState(emptyUser);
  const [editingId, setEditingId] = useState(null);
  const [roomForm, setRoomForm] = useState(emptyRoom);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState("ALL");
  const [adminRoomSearch, setAdminRoomSearch] = useState("");
  const [adminRoomStatusFilter, setAdminRoomStatusFilter] = useState("ALL");
  const [adminRoomTypeFilter, setAdminRoomTypeFilter] = useState("ALL");
  const [adminFloorFilter, setAdminFloorFilter] = useState("ALL");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    const [userResponse, recentUserResponse, userStatsResponse, roomResponse] = await Promise.all([
      getUsers(),
      getRecentUsers(),
      getUserStats(),
      getRooms()
    ]);

    setUsers(userResponse.data);
    setRecentUsers(recentUserResponse.data);
    setStats(userStatsResponse.data);
    setRooms(roomResponse.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      if (editingId) {
        await updateUser(editingId, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          role: form.role,
          active: form.active
        });

        setMessage("User updated successfully");
      } else {
        await createUser(form);
        setMessage("User created successfully");
      }

      setForm(emptyUser);
      setEditingId(null);
      loadData();
    } catch (err) {
      setMessage(getErrorMessage(err, "User operation failed"));
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "",
      role: user.role,
      active: user.active
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyUser);
  };

  const handleDeactivate = async (id) => {
    setMessage("");

    try {
      await deactivateUser(id);
      setMessage("User deactivated successfully");
      loadData();
    } catch (err) {
      setMessage(getErrorMessage(err, "Failed to deactivate user"));
    }
  };

  const handleActivate = async (id) => {
    setMessage("");

    try {
      await activateUser(id);
      setMessage("User activated successfully");
      loadData();
    } catch (err) {
      setMessage(getErrorMessage(err, "Failed to activate user"));
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this user permanently? Use deactivate for real staff records.");

    if (!confirmed) {
      return;
    }

    setMessage("");

    try {
      await deleteUser(id);
      setMessage("User deleted successfully");
      loadData();
    } catch (err) {
      setMessage(getErrorMessage(err, "Failed to delete user"));
    }
  };

  const handleRoomFormChange = (event) => {
    const { name, value } = event.target;

    setRoomForm({
      ...roomForm,
      [name]: value
    });
  };

  const handleRoomSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const payload = {
      ...roomForm,
      pricePerNight: Number(roomForm.pricePerNight),
      floor: Number(roomForm.floor)
    };

    try {
      if (editingRoomId) {
        await updateRoom(editingRoomId, payload);
        setMessage("Room updated successfully");
      } else {
        await createRoom(payload);
        setMessage("Room added successfully");
      }

      setRoomForm(emptyRoom);
      setEditingRoomId(null);
      loadData();
    } catch (err) {
      setMessage(getErrorMessage(err, "Room operation failed"));
    }
  };

  const handleRoomEdit = (room) => {
    setEditingRoomId(room.id);
    setRoomForm({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      floor: room.floor,
      status: room.status
    });
  };

  const handleCancelRoomEdit = () => {
    setEditingRoomId(null);
    setRoomForm(emptyRoom);
  };

  const handleRoomDelete = async (id) => {
    const confirmed = window.confirm("Delete this room permanently? Use maintenance status if the room should only be unavailable.");

    if (!confirmed) {
      return;
    }

    setMessage("");

    try {
      await deleteRoom(id);
      setMessage("Room deleted successfully");
      loadData();
    } catch (err) {
      setMessage(getErrorMessage(err, "Failed to delete room"));
    }
  };

  const handleRoomMaintenance = async (roomId) => {
    setMessage("");

    try {
      await updateRoomStatus(roomId, "MAINTENANCE");
      setMessage("Room marked as unavailable for maintenance");
      loadData();
    } catch (err) {
      setMessage(getErrorMessage(err, "Failed to update room"));
    }
  };

  const handleRoomAvailable = async (roomId) => {
    setMessage("");

    try {
      await updateRoomStatus(roomId, "AVAILABLE");
      setMessage("Room marked as available");
      loadData();
    } catch (err) {
      setMessage(getErrorMessage(err, "Failed to update room"));
    }
  };

  const activeRoomCount = rooms.filter((room) => room.status !== "MAINTENANCE").length;
  const maintenanceRoomCount = rooms.filter((room) => room.status === "MAINTENANCE").length;

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`;
    const email = user.email || "";

    const matchesSearch =
      fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      email.toLowerCase().includes(userSearch.toLowerCase());

    const matchesRole = userRoleFilter === "ALL" || user.role === userRoleFilter;

    const matchesStatus =
      userStatusFilter === "ALL" ||
      (userStatusFilter === "ACTIVE" && user.active) ||
      (userStatusFilter === "DEACTIVATED" && !user.active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const adminFloors = [...new Set(rooms.map((room) => room.floor).filter(Boolean))].sort(
    (a, b) => Number(a) - Number(b)
  );

  const filteredAdminRooms = rooms.filter((room) => {
    const matchesSearch = String(room.roomNumber || "")
      .toLowerCase()
      .includes(adminRoomSearch.toLowerCase());

    const matchesStatus =
      adminRoomStatusFilter === "ALL" || room.status === adminRoomStatusFilter;

    const matchesType =
      adminRoomTypeFilter === "ALL" || room.roomType === adminRoomTypeFilter;

    const matchesFloor =
      adminFloorFilter === "ALL" || String(room.floor) === adminFloorFilter;

    return matchesSearch && matchesStatus && matchesType && matchesFloor;
  });

  return (
    <AppShell title="Admin Dashboard" subtitle="Manage system users, roles, access, and core ERP administration.">
      {message && <div className="alert">{message}</div>}

      <section className="stats-grid">
        <StatCard label="Total Users" value={stats.totalUsers || users.length} />
        <StatCard label="Active Users" value={stats.activeUsers || 0} />
        <StatCard label="Deactivated Users" value={stats.deactivatedUsers || 0} />
        <StatCard label="Total Rooms" value={rooms.length} />
        <StatCard label="Active Rooms" value={activeRoomCount} />
        <StatCard label="Maintenance Rooms" value={maintenanceRoomCount} />
      </section>

      <section className="management-grid">
        <form className="panel form-grid two" onSubmit={handleSubmit}>
          <h3 className="span-two">{editingId ? "Update App User" : "Add App User"}</h3>

          <label>
            First Name
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Last Name
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </label>

          <label className="span-two">
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          {!editingId && (
            <label className="span-two">
              Password
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>
          )}

          <label>
            Role
            <select name="role" value={form.role} onChange={handleChange}>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>

          <label>
            Account Status
            <select name="active" value={String(form.active)} onChange={(event) => setForm({ ...form, active: event.target.value === "true" })}>
              <option value="true">Active</option>
              <option value="false">Deactivated</option>
            </select>
          </label>

          <button className="primary-button span-two" type="submit">
            {editingId ? "Save User Changes" : "Create App User"}
          </button>

          {editingId && (
            <button className="secondary-button span-two" type="button" onClick={handleCancelEdit}>
              Cancel Edit
            </button>
          )}
        </form>

        <section className="panel">
          <h3>Quick Admin Actions</h3>
          <div className="quick-actions">
            <button type="button" onClick={() => setForm(emptyUser)}>
              Add App User
            </button>
            <button type="button" onClick={() => document.getElementById("users-table")?.scrollIntoView({ behavior: "smooth" })}>
              Manage App Users
            </button>
            <button type="button" onClick={() => document.getElementById("rooms-admin")?.scrollIntoView({ behavior: "smooth" })}>
              Manage Rooms
            </button>
            <button type="button" onClick={() => document.getElementById("role-access")?.scrollIntoView({ behavior: "smooth" })}>
              View Role Access
            </button>
          </div>

          <div className="admin-mini-stats">
            <div>
              <strong>{stats.admins || 0}</strong>
              <span>Admins</span>
            </div>
            <div>
              <strong>{stats.managers || 0}</strong>
              <span>Managers</span>
            </div>
            <div>
              <strong>{stats.receptionists || 0}</strong>
              <span>Receptionists</span>
            </div>
            <div>
              <strong>{stats.serviceStaff || 0}</strong>
              <span>Service Staff</span>
            </div>
          </div>
        </section>

        <section id="users-table" className="panel table-panel span-wide">
          <h3>User Management</h3>

          <div className="table-filters">
            <input
              placeholder="Search name or email"
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
            />

            <select value={userRoleFilter} onChange={(event) => setUserRoleFilter(event.target.value)}>
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="SERVICE_STAFF">Service Staff</option>
            </select>

            <select value={userStatusFilter} onChange={(event) => setUserStatusFilter(event.target.value)}>
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="DEACTIVATED">Deactivated</option>
            </select>
          </div>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.role?.replace("_", " ")}</td>
                  <td>
                    <StatusBadge status={user.active ? "ACTIVE" : "DEACTIVATED"} />
                  </td>
                  <td className="table-actions">
                    <button type="button" onClick={() => handleEdit(user)}>
                      Edit
                    </button>

                    {user.active ? (
                      <button type="button" onClick={() => handleDeactivate(user.id)}>
                        Deactivate
                      </button>
                    ) : (
                      <button type="button" onClick={() => handleActivate(user.id)}>
                        Activate
                      </button>
                    )}

                    <button className="danger" type="button" onClick={() => handleDelete(user.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel table-panel">
          <h3>Recent Users</h3>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.role?.replace("_", " ")}</td>
                  <td className="table-actions">
                    <button type="button" onClick={() => handleEdit(user)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section id="role-access" className="panel">
          <h3>Role & Access Overview</h3>

          <div className="role-access-list">
            {roleAccess.map((item) => (
              <div key={item.role} className="role-access-item">
                <strong>{item.role.replace("_", " ")}</strong>
                <p>{item.access}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="rooms-admin" className="panel table-panel span-wide">
          <h3>Room Administration</h3>

          <form className="panel form-grid two span-wide" onSubmit={handleRoomSubmit}>
            <h3 className="span-two">{editingRoomId ? "Update Room" : "Add Room"}</h3>

            <label>
              Room Number
              <input
                name="roomNumber"
                value={roomForm.roomNumber}
                onChange={handleRoomFormChange}
                required
              />
            </label>

            <label>
              Room Type
              <select
                name="roomType"
                value={roomForm.roomType}
                onChange={handleRoomFormChange}
              >
                <option>Standard</option>
                <option>Deluxe</option>
                <option>Suite</option>
                <option>Family</option>
              </select>
            </label>

            <label>
              Price Per Night
              <input
                name="pricePerNight"
                type="number"
                min="0"
                value={roomForm.pricePerNight}
                onChange={handleRoomFormChange}
                required
              />
            </label>

            <label>
              Floor
              <input
                name="floor"
                type="number"
                min="1"
                value={roomForm.floor}
                onChange={handleRoomFormChange}
                required
              />
            </label>

            <label className="span-two">
              Status
              <select
                name="status"
                value={roomForm.status}
                onChange={handleRoomFormChange}
              >
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </label>

            <button className="primary-button span-two" type="submit">
              {editingRoomId ? "Save Room Changes" : "Add Room"}
            </button>

            {editingRoomId && (
              <button className="secondary-button span-two" type="button" onClick={handleCancelRoomEdit}>
                Cancel Room Edit
              </button>
            )}
          </form>

          <div className="table-filters">
            <input
              placeholder="Search room number"
              value={adminRoomSearch}
              onChange={(event) => setAdminRoomSearch(event.target.value)}
            />

            <select value={adminRoomStatusFilter} onChange={(event) => setAdminRoomStatusFilter(event.target.value)}>
              <option value="ALL">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>

            <select value={adminRoomTypeFilter} onChange={(event) => setAdminRoomTypeFilter(event.target.value)}>
              <option value="ALL">All Types</option>
              <option value="Standard">Standard</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
              <option value="Family">Family</option>
            </select>

            <select value={adminFloorFilter} onChange={(event) => setAdminFloorFilter(event.target.value)}>
              <option value="ALL">All Floors</option>
              {adminFloors.map((floor) => (
                <option key={floor} value={floor}>
                  Floor {floor}
                </option>
              ))}
            </select>
          </div>

          <table>
            <thead>
              <tr>
                <th>Room</th>
                <th>Type</th>
                <th>Floor</th>
                <th>Rate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAdminRooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.roomNumber}</td>
                  <td>{room.roomType}</td>
                  <td>Floor {room.floor || "-"}</td>
                  <td>LKR {Number(room.pricePerNight || 0).toLocaleString()}</td>
                  <td>
                    <StatusBadge status={room.status} />
                  </td>
                  <td className="table-actions">
                    <button type="button" onClick={() => handleRoomEdit(room)}>
                      Edit
                    </button>

                    <button type="button" onClick={() => handleRoomAvailable(room.id)}>
                      Set Available
                    </button>

                    <button type="button" onClick={() => handleRoomMaintenance(room.id)}>
                      Deactivate Room
                    </button>

                    <button className="danger" type="button" onClick={() => handleRoomDelete(room.id)}>
                      Delete
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

export default AdminDashboard;