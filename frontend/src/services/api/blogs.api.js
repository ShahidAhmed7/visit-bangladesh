import apiClient from "./base.js";

export const blogsAPI = {
  getAll: () => apiClient.get("/api/blogs"),
  getById: (id) => apiClient.get(`/api/blogs/${id}`),
  create: (data) => apiClient.post("/api/blogs", data),
  update: (id, data) => apiClient.put(`/api/blogs/${id}`, data),
  delete: (id) => apiClient.delete(`/api/blogs/${id}`),
  like: (id) => apiClient.post(`/api/blogs/${id}/like`),
  unlike: (id) => apiClient.post(`/api/blogs/${id}/unlike`),
  addComment: (id, text) => apiClient.post(`/api/blogs/${id}/comment`, { text }),
  deleteComment: (id, commentId) => apiClient.delete(`/api/blogs/${id}/comment/${commentId}`),
};
