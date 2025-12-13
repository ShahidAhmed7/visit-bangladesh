import apiClient from "./base.js";

export const eventsAPI = {
  list: (params = {}) => apiClient.get("/api/events", { params }),
  adminList: (params = {}) => apiClient.get("/api/events/admin/all/list", { params }),
  getById: (id) => apiClient.get(`/api/events/${id}`),
  create: (data) => apiClient.post("/api/events", data),
  update: (id, data) => apiClient.put(`/api/events/${id}`, data),
  approve: (id) => apiClient.post(`/api/events/${id}/approve`),
  reject: (id) => apiClient.post(`/api/events/${id}/reject`),
  toggleInterested: (id) => apiClient.post(`/api/events/${id}/interested`),
  toggleBookmark: (id) => apiClient.post(`/api/events/${id}/bookmark`),
  addComment: (id, text) => apiClient.post(`/api/events/${id}/comments`, { text }),
  deleteComment: (id, commentId) => apiClient.delete(`/api/events/${id}/comments/${commentId}`),
  myBookmarked: () => apiClient.get("/api/events/me/bookmarked/list"),
  myInterested: () => apiClient.get("/api/events/me/interested/list"),
};
