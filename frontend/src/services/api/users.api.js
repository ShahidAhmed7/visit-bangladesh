import apiClient from "./base.js";

export const usersAPI = {
  getMe: () => apiClient.get("/api/users/me"),
  updateProfile: (data) => apiClient.put("/api/users/me", data),
  changePassword: (data) => apiClient.put("/api/users/me/password", data),
  getFollowedGuides: () => apiClient.get("/api/users/me/followed-guides"),
  getBookmarks: () => apiClient.get("/api/users/me/bookmarks"),
  getReviews: () => apiClient.get("/api/users/me/reviews"),
  getRegistrations: () => apiClient.get("/api/users/me/registrations"),
  addSpotBookmark: (spotId) => apiClient.post(`/api/users/me/bookmarks/spots/${spotId}`),
  removeSpotBookmark: (spotId) => apiClient.delete(`/api/users/me/bookmarks/spots/${spotId}`),
};
