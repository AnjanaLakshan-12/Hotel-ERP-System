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
