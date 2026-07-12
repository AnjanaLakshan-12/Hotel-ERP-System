import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import RoomCard from "../../components/RoomCard";
import StatusBadge from "../../components/StatusBadge";
import { createRoom, deleteRoom, getRooms, updateRoom, updateRoomStatus } from "../../services/roomService";

const emptyRoom = {
  roomNumber: "",
  roomType: "Standard",
  pricePerNight: "",
  floor: "",
  status: "AVAILABLE"
};

function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(emptyRoom);
  const [editingId, setEditingId] = useState(null);

  const loadRooms = async () => {
    const response = await getRooms();
    setRooms(response.data);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      pricePerNight: Number(form.pricePerNight),
      floor: Number(form.floor)
    };
    if (editingId) {
      await updateRoom(editingId, payload);
    } else {
      await createRoom(payload);
    }
    setForm(emptyRoom);
    setEditingId(null);
    loadRooms();
  };

  const handleEdit = (room) => {
    setEditingId(room.id);
    setForm({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      floor: room.floor,
      status: room.status
    });
  };

  const handleStatus = async (id, status) => {
    await updateRoomStatus(id, status);
    loadRooms();
  };

  const handleDelete = async (id) => {
    await deleteRoom(id);
    loadRooms();
  };

  return (
    <AppShell title="Room Management" subtitle="Control room inventory, pricing, and availability.">
      <section className="room-grid">
        {rooms.slice(0, 4).map((room) => <RoomCard key={room.id} room={room} />)}
      </section>

      <section className="management-grid">
        <form className="panel form-grid two" onSubmit={handleSubmit}>
          <h3 className="span-two">{editingId ? "Update Room" : "Add Room"}</h3>
          <label>
            Room Number
            <input name="roomNumber" value={form.roomNumber} onChange={handleChange} required />
          </label>
          <label>
            Room Type
            <select name="roomType" value={form.roomType} onChange={handleChange}>
              <option>Standard</option>
              <option>Deluxe</option>
              <option>Suite</option>
              <option>Family</option>
            </select>
          </label>
          <label>
            Price Per Night
            <input name="pricePerNight" type="number" value={form.pricePerNight} onChange={handleChange} required />
          </label>
          <label>
            Floor
            <input name="floor" type="number" min="1" value={form.floor} onChange={handleChange} required />
          </label>
          <label>
            Status
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </label>
          <button className="primary-button span-two" type="submit">{editingId ? "Save Changes" : "Add Room"}</button>
        </form>

        <section className="panel table-panel">
          <h3>Room Inventory</h3>
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
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.roomNumber}</td>
                  <td>{room.roomType}</td>
                  <td>Floor {room.floor || "-"}</td>
                  <td>LKR {Number(room.pricePerNight || 0).toLocaleString()}</td>
                  <td><StatusBadge status={room.status} /></td>
                  <td className="table-actions">
                    <button onClick={() => handleEdit(room)}>Edit</button>
                    <button onClick={() => handleStatus(room.id, "AVAILABLE")}>Available</button>
                    <button className="danger" onClick={() => handleDelete(room.id)}>Delete</button>
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
