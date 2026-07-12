import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://otel-erp-backend-anjan-c6a9fraackccb2fs.southeastasia-01.azurewebsites.net",
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;
