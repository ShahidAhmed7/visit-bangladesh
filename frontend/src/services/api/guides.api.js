import apiClient from "./base.js";

export const guidesAPI = {
  list: (params = {}) => apiClient.get("/api/guides", { params }),
  getById: (id) => apiClient.get(`/api/guides/${id}`),
  listReviews: (id, params = {}) => apiClient.get(`/api/guides/${id}/reviews`, { params }),
  createReview: (id, data) => apiClient.post(`/api/guides/${id}/reviews`, data),
  updateReview: (id, reviewId, data) => apiClient.put(`/api/guides/${id}/reviews/${reviewId}`, data),
  deleteReview: (id, reviewId) => apiClient.delete(`/api/guides/${id}/reviews/${reviewId}`),
  listEvents: (id) => apiClient.get(`/api/guides/${id}/events`),
  listBlogs: (id) => apiClient.get(`/api/guides/${id}/blogs`),
  follow: (id) => apiClient.post(`/api/guides/${id}/follow`),
  unfollow: (id) => apiClient.delete(`/api/guides/${id}/follow`),
};
