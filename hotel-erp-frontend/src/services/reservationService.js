import api from "./axios";

export const getReservations = () => api.get("/api/reservations");

export const createReservation = (reservation) => api.post("/api/reservations", reservation);

export const updateReservationStatus = (id, status) =>
  api.patch(`/api/reservations/${id}/status?status=${status}`);

export const earlyCheckout = (id, actualCheckoutDate) =>
  api.patch(`/api/reservations/${id}/early-checkout?actualCheckoutDate=${actualCheckoutDate}`);
