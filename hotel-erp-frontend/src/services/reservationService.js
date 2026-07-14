import api from "./axios";

export const getReservations = () => api.get("/api/reservations");

export const createReservation = (reservation) => api.post("/api/reservations", reservation);

export const updateReservationStatus = (id, status) =>
  api.patch(`/api/reservations/${id}/status?status=${status}`);

export const earlyCheckout = (id, actualCheckoutDate) =>
  api.patch(`/api/reservations/${id}/early-checkout?actualCheckoutDate=${actualCheckoutDate}`);


// export const cancelReservation = (id, cancellationData) =>
//   api.patch(`/api/reservations/${id}/cancel`, cancellationData);

export const requestReservationCancellation = (id, request) =>
  api.patch(`/api/reservations/${id}/request-cancellation`, request);

export const processReservationCancellation = (id, request) =>
  api.patch(`/api/reservations/${id}/process-cancellation`, request);