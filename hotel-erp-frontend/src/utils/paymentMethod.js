export const paymentMethods = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "ONLINE_TRANSFER", label: "Online Transfer" }
];

export const formatPaymentMethod = (method) => {
  if (!method) {
    return "-";
  }

  const paymentMethod = paymentMethods.find((item) => item.value === method);

  return paymentMethod ? paymentMethod.label : method.replaceAll("_", " ");
};
