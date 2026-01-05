import apiClient from "./base.js";

export const notificationsAPI = {
  list: (params = {}) => apiClient.get("/api/notifications", { params }),
  markRead: (id) => apiClient.patch(`/api/notifications/${id}/read`),
  markAllRead: () => apiClient.patch("/api/notifications/read-all"),
};
