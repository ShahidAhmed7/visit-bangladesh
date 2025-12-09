import apiClient from "./base.js";

export const authAPI = {
  register: (data) => apiClient.post("/api/auth/register", data),
  login: (data) => apiClient.post("/api/auth/login", data),
  me: () => apiClient.get("/api/auth/me"),
};
