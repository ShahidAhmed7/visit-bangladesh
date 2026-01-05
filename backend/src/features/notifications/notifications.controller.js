import Notification from "../../models/Notification.js";
import { asyncHandler, successResponse } from "../../shared/utils.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
  const unreadOnly = String(req.query.unread || "").toLowerCase() === "true";
  const filter = { recipient: req.user.id };
  if (unreadOnly) filter.isRead = false;
  const notifications = await Notification.find(filter)
    .populate({ path: "actor", select: "name avatarUrl role" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return res.json(successResponse({ notifications }));
});

export const markRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await Notification.findOneAndUpdate(
    { _id: id, recipient: req.user.id },
    { isRead: true },
    { new: true }
  ).lean();
  return res.json(successResponse(updated));
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
  return res.json(successResponse(null, "All notifications marked as read"));
});
