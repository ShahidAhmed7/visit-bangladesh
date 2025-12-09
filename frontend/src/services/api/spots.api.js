import apiClient from "./base.js";

export const spotsAPI = {
  getAll: () => apiClient.get("/api/spots"),
  getById: (id) => apiClient.get(`/api/spots/${id}`),
};
