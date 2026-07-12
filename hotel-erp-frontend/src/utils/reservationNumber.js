export const formatReservationNumber = (id) => {
  if (!id) {
    return "RES-0000";
  }

  return `RES-${String(id).padStart(4, "0")}`;
};
