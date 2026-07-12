import api from "./axios";

export const registerUser = (user) => api.post("/api/auth/register", user);

export const loginUser = (credentials) => api.post("/api/auth/login", credentials);
