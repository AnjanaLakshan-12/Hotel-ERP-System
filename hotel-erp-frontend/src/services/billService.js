import api from "./axios";

export const getBills = () => api.get("/api/bills");

export const getFolioPreview = (reservationId) => api.get(`/api/bills/folio/${reservationId}`);

export const generateBill = (reservationId) => api.post(`/api/bills/generate/${reservationId}`);

export const updateBillStatus = (id, status, paymentMethod = "") => {
  const paymentQuery = paymentMethod ? `&paymentMethod=${encodeURIComponent(paymentMethod)}` : "";

  return api.patch(`/api/bills/${id}/status?status=${status}${paymentQuery}`);
};

export const downloadInvoicePdf = (id) =>
  api.get(`/api/bills/${id}/download`, {
    responseType: "blob"
  });
