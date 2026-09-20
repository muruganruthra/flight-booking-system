import api from "./api";

const register = async (userData) => {
  const response = await api.post("/auth/register", userData);

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem(
      "user",
      JSON.stringify(response.data.user)
    );
  }

  return response.data;
};

const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem(
      "user",
      JSON.stringify(response.data.user)
    );
  }

  return response.data;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const getCurrentUser = () => {
  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
};

const getToken = () => {
  return localStorage.getItem("token");
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  getToken,
};

export default authService;