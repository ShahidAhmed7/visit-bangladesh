const STORAGE_KEY = "vb_chat_last_seen_v1";

const getKey = (userId) => `${STORAGE_KEY}_${userId}`;

export const getChatLastSeen = (userId) => {
  if (!userId || typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(getKey(userId));
  if (!raw) return 0;
  const parsed = new Date(raw).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const setChatLastSeen = (userId, timestamp = new Date().toISOString()) => {
  if (!userId || typeof window === "undefined") return;
  const value = typeof timestamp === "number" ? new Date(timestamp).toISOString() : timestamp;
  window.localStorage.setItem(getKey(userId), value);
};
