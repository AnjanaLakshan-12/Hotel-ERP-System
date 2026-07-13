import api from "./axios";

export const createMaintenanceRequest = (request) =>
  api.post("/api/maintenance-requests", request);

export const getMaintenanceRequests = () =>
  api.get("/api/maintenance-requests");

export const getPendingMaintenanceRequests = () =>
  api.get("/api/maintenance-requests/pending");

export const approveMaintenanceRequest = (id, managerNote = "", priority = "MEDIUM") =>
  api.patch(
    `/api/maintenance-requests/${id}/approve?managerNote=${encodeURIComponent(managerNote)}&priority=${priority}`
  );

export const rejectMaintenanceRequest = (id, managerNote = "") =>
  api.patch(
    `/api/maintenance-requests/${id}/reject?managerNote=${encodeURIComponent(managerNote)}`
  );

export const completeMaintenanceRequest = (id) =>
  api.patch(`/api/maintenance-requests/${id}/complete`);