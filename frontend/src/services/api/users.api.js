import apiClient from "./base.js";

export const usersAPI = {
  getMe: () => apiClient.get("/api/users/me"),
  updateProfile: (data) => apiClient.put("/api/users/me", data),
  changePassword: (data) => apiClient.put("/api/users/me/password", data),
};
