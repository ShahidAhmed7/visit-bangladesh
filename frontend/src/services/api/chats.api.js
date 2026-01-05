import apiClient from "./base.js";

export const chatsAPI = {
  listThreads: () => apiClient.get("/api/chats/threads"),
  listMessages: (threadId, params = {}) => apiClient.get(`/api/chats/threads/${threadId}/messages`, { params }),
  sendMessage: (threadId, payload) => apiClient.post(`/api/chats/threads/${threadId}/messages`, payload),
};
