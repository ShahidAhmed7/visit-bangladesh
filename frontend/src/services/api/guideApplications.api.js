import apiClient from "./base.js";

export const guideApplicationsAPI = {
  apply: (payload) => apiClient.post("/api/guide-applications", payload),
  getMine: () => apiClient.get("/api/guide-applications/me"),
  adminList: (params) => apiClient.get("/api/admin/guide-applications", { params }),
  adminGet: (id) => apiClient.get(`/api/admin/guide-applications/${id}`),
  approve: (id, body) => apiClient.patch(`/api/admin/guide-applications/${id}/approve`, body),
  reject: (id, body) => apiClient.patch(`/api/admin/guide-applications/${id}/reject`, body),
};

export default guideApplicationsAPI;
