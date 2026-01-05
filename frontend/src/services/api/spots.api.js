import apiClient from "./base.js";

export const spotsAPI = {
  // Accept query params: { q, categories, division, district, minRating, sort, page, limit }
  getAll: (params = {}) => apiClient.get("/api/spots", { params }),
  getById: (id) => apiClient.get(`/api/spots/${id}`),
  listReviews: (id, params = {}) => apiClient.get(`/api/spots/${id}/reviews`, { params }),
  createReview: (id, data) => apiClient.post(`/api/spots/${id}/reviews`, data),
  updateReview: (id, reviewId, data) => apiClient.put(`/api/spots/${id}/reviews/${reviewId}`, data),
  deleteReview: (id, reviewId) => apiClient.delete(`/api/spots/${id}/reviews/${reviewId}`),
};
