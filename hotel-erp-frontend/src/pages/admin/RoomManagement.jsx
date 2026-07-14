import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import RoomCard from "../../components/RoomCard";
import StatusBadge from "../../components/StatusBadge";
import { createMaintenanceRequest } from "../../services/maintenanceRequestService";
import { getRooms, updateRoomStatus } from "../../services/roomService";

const emptyMaintenanceRequest = {
  roomId: "",
  reportedBy: "Receptionist",
  issueTitle: "",
  description: ""
};

function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [maintenanceForm, setMaintenanceForm] = useState(emptyMaintenanceRequest);
  const [message, setMessage] = useState("");

  const [roomSearch, setRoomSearch] = useState("");
  const [roomStatusFilter, setRoomStatusFilter] = useState("ALL");
  const [roomTypeFilter, setRoomTypeFilter] = useState("ALL");
  const [floorFilter, setFloorFilter] = useState("ALL");

  const loadRooms = async () => {
    const response = await getRooms();
    setRooms(response.data);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleMaintenanceChange = (event) => {
    setMaintenanceForm({
      ...maintenanceForm,
      [event.target.name]: event.target.value
    });
  };

  const handleMaintenanceSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      await createMaintenanceRequest({
        ...maintenanceForm,
        roomId: Number(maintenanceForm.roomId)
      });

      setMessage("Maintenance report submitted to manager");
      setMaintenanceForm(emptyMaintenanceRequest);
    } catch (err) {
      setMessage(err.response?.data || "Failed to submit maintenance report");
    }
  };

  const handleStatus = async (id, status) => {
    setMessage("");

    try {
      await updateRoomStatus(id, status);
      setMessage("Room status updated");
      loadRooms();
    } catch (err) {
      setMessage(err.response?.data || "Failed to update room status");
    }
  };

  const floors = [...new Set(rooms.map((room) => room.floor).filter(Boolean))].sort(
    (a, b) => Number(a) - Number(b)
  );

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = String(room.roomNumber || "")
      .toLowerCase()
      .includes(roomSearch.toLowerCase());

    const matchesStatus =
      roomStatusFilter === "ALL" || room.status === roomStatusFilter;

    const matchesType =
      roomTypeFilter === "ALL" || room.roomType === roomTypeFilter;

    const matchesFloor =
      floorFilter === "ALL" || String(room.floor) === floorFilter;

    return matchesSearch && matchesStatus && matchesType && matchesFloor;
  });

  return (
    <AppShell title="Room Management" subtitle="Control room availability, and maintenance reports.">
      <section className="room-grid">
        {rooms.slice(0, 4).map((room) => <RoomCard key={room.id} room={room} />)}
      </section>

      {message && <div className="alert">{message}</div>}

      <section className="management-grid">
        <form className="panel form-grid two" onSubmit={handleMaintenanceSubmit}>
          <h3 className="span-two">Submit Maintenance Report</h3>
          <p className="panel-note span-two">
            Receptionists can report room issues to the manager. The manager reviews the request and decides maintenance priority.
          </p>

          <label className="span-two">
            Room
            <select
              name="roomId"
              value={maintenanceForm.roomId}
              onChange={handleMaintenanceChange}
              required
            >
              <option value="">Select room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  Room {room.roomNumber} - {room.roomType} - Floor {room.floor || "-"} - {room.status}
                </option>
              ))}
            </select>
          </label>

          <label className="span-two">
            Issue Title
            <input
              name="issueTitle"
              value={maintenanceForm.issueTitle}
              onChange={handleMaintenanceChange}
              placeholder="Air conditioner not working"
              required
            />
          </label>

          <label className="span-two">
            Description
            <textarea
              name="description"
              value={maintenanceForm.description}
              onChange={handleMaintenanceChange}
              placeholder="Describe the issue reported by guest or staff"
              required
            />
          </label>

          <button className="primary-button span-two" type="submit">
            Send Report To Manager
          </button>
        </form>

        <section className="panel table-panel span-wide">
          <h3>Room Inventory</h3>

          <div className="table-filters">
            <input
              placeholder="Search room number"
              value={roomSearch}
              onChange={(event) => setRoomSearch(event.target.value)}
            />

            <select value={roomStatusFilter} onChange={(event) => setRoomStatusFilter(event.target.value)}>
              <option value="ALL">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>

            <select value={roomTypeFilter} onChange={(event) => setRoomTypeFilter(event.target.value)}>
              <option value="ALL">All Types</option>
              <option value="Standard">Standard</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
              <option value="Family">Family</option>
            </select>

            <select value={floorFilter} onChange={(event) => setFloorFilter(event.target.value)}>
              <option value="ALL">All Floors</option>
              {floors.map((floor) => (
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
              {filteredRooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.roomNumber}</td>
                  <td>{room.roomType}</td>
                  <td>Floor {room.floor || "-"}</td>
                  <td>LKR {Number(room.pricePerNight || 0).toLocaleString()}</td>
                  <td><StatusBadge status={room.status} /></td>
                  <td className="table-actions">
                    <button type="button" onClick={() => handleStatus(room.id, "AVAILABLE")}>
                      Available
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

export default RoomManagement;