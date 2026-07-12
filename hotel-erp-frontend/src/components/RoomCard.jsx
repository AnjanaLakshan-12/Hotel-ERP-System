import StatusBadge from "./StatusBadge";

function RoomCard({ room }) {
  return (
    <article className="room-card">
      <div>
        <span className="room-number">Room {room.roomNumber}</span>
        <StatusBadge status={room.status} />
      </div>
      <h3>{room.roomType}</h3>
      <p>Floor {room.floor || "-"}</p>
      <p>LKR {Number(room.pricePerNight || 0).toLocaleString()} per night</p>
    </article>
  );
}

export default RoomCard;
