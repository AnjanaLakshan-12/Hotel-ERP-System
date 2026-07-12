import api from "./axios";

export const getDashboardSummary = () => api.get("/api/dashboard/summary");
