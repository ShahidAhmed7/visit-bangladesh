import Notification from "../../models/Notification.js";

export const createNotification = async (payload) => {
  if (!payload?.recipient) return null;
  return Notification.create(payload);
};

export const createNotifications = async (recipients, payload) => {
  if (!Array.isArray(recipients) || !recipients.length) return [];
  const docs = recipients.map((recipientId) => ({
    ...payload,
    recipient: recipientId,
  }));
  return Notification.insertMany(docs);
};

export const createNotificationsForRecipients = async (recipients, payload, actorId) => {
  if (!Array.isArray(recipients) || !recipients.length) return [];
  const unique = Array.from(new Set(recipients.map(String))).filter((id) => id && (!actorId || String(id) !== String(actorId)));
  if (!unique.length) return [];
  const docs = unique.map((recipientId) => ({
    ...payload,
    recipient: recipientId,
  }));
  return Notification.insertMany(docs);
};
