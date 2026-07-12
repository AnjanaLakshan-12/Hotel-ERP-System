import api from "./axios";

export const getCustomers = () => api.get("/api/customers");

export const getCustomerById = (id) => api.get(`/api/customers/${id}`);

export const createCustomer = (customer) => api.post("/api/customers", customer);

export const updateCustomer = (id, customer) => api.put(`/api/customers/${id}`, customer);

export const deleteCustomer = (id) => api.delete(`/api/customers/${id}`);

export const searchCustomers = (keyword) => api.get(`/api/customers/search?keyword=${keyword}`);
