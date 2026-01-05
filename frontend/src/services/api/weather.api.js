import apiClient from "./base.js";

export const weatherAPI = {
  suggest: (query, limit = 6) => apiClient.get("/api/weather/suggest", { params: { query, limit } }),
  current: (lat, lon) => apiClient.get("/api/weather/current", { params: { lat, lon } }),
};
