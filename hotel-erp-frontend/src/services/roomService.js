import api from "./axios";

export const getRooms = () => api.get("/api/rooms");

export const getAvailableRooms = () => api.get("/api/rooms/available");

export const createRoom = (room) => api.post("/api/rooms", room);

export const updateRoom = (id, room) => api.put(`/api/rooms/${id}`, room);

export const updateRoomStatus = (id, status) => api.patch(`/api/rooms/${id}/status?status=${status}`);

export const deleteRoom = (id) => api.delete(`/api/rooms/${id}`);