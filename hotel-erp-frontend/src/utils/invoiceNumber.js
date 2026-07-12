export const formatInvoiceNumber = (id) => {
  if (!id) {
    return "INV-0000";
  }

  return `INV-${String(id).padStart(4, "0")}`;
};
