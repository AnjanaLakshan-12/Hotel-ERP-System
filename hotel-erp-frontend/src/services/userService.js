import api from "./axios";

export const getStoredUser = () => {
  const user = localStorage.getItem("hotelUser");
  return user ? JSON.parse(user) : null;
};

export const storeUser = (user) => {
  localStorage.setItem("hotelUser", JSON.stringify(user));
};

export const clearStoredUser = () => {
  localStorage.removeItem("hotelUser");
};

export const getUsers = () => api.get("/api/users");

export const getRecentUsers = () => api.get("/api/users/recent");

export const getUserStats = () => api.get("/api/users/stats");

export const createUser = (user) => api.post("/api/users", user);

export const updateUser = (id, user) => api.put(`/api/users/${id}`, user);

export const deactivateUser = (id) => api.patch(`/api/users/${id}/deactivate`);

export const activateUser = (id) => api.patch(`/api/users/${id}/activate`);

export const deleteUser = (id) => api.delete(`/api/users/${id}`);