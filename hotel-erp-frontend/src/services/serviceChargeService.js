import api from "./axios";

export const getServiceCharges = () => api.get("/api/service-charges");

export const getServiceChargesByReservation = (reservationId) =>
  api.get(`/api/service-charges/reservation/${reservationId}`);

export const addServiceCharge = (serviceCharge) =>
  api.post("/api/service-charges", serviceCharge);
