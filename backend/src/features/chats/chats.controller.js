import ChatMessage from "../../models/ChatMessage.js";
import ChatThread from "../../models/ChatThread.js";
import Event from "../../models/Event.js";
import EventRegistration from "../../models/EventRegistration.js";
import { ForbiddenError, NotFoundError, ValidationError } from "../../shared/errors.js";
import { asyncHandler, successResponse } from "../../shared/utils.js";

const ensureThreadsForUser = async (user) => {
  if (!user?.id) return;
  if (user.role === "guide") {
    const events = await Event.find({ createdBy: user.id }).select("_id").lean();
    if (!events.length) return;
    const eventIds = events.map((event) => event._id);
    const registrations = await EventRegistration.find({ eventId: { $in: eventIds } })
      .select("eventId userId")
      .lean();
    if (!registrations.length) return;
    const ops = registrations.map((reg) => ({
      updateOne: {
        filter: { eventId: reg.eventId, userId: reg.userId },
        update: { $setOnInsert: { eventId: reg.eventId, userId: reg.userId, guideId: user.id } },
        upsert: true,
      },
    }));
    await ChatThread.bulkWrite(ops);
    return;
  }

  const registrations = await EventRegistration.find({ userId: user.id }).select("eventId").lean();
  if (!registrations.length) return;
  const eventIds = registrations.map((reg) => reg.eventId);
  const events = await Event.find({ _id: { $in: eventIds } }).select("_id createdBy").lean();
  if (!events.length) return;
  const guideMap = new Map(events.map((event) => [String(event._id), event.createdBy]));
  const ops = registrations
    .map((reg) => {
      const guideId = guideMap.get(String(reg.eventId));
      if (!guideId) return null;
      return {
        updateOne: {
          filter: { eventId: reg.eventId, userId: user.id },
          update: { $setOnInsert: { eventId: reg.eventId, userId: user.id, guideId } },
          upsert: true,
        },
      };
    })
    .filter(Boolean);
  if (ops.length) {
    await ChatThread.bulkWrite(ops);
  }
};

const canAccessThread = (thread, userId) =>
  String(thread.userId?._id || thread.userId) === String(userId) ||
  String(thread.guideId?._id || thread.guideId) === String(userId);

export const listThreads = asyncHandler(async (req, res) => {
  await ensureThreadsForUser(req.user);
  const threads = await ChatThread.find({
    $or: [{ userId: req.user.id }, { guideId: req.user.id }],
  })
    .populate({ path: "eventId", select: "title" })
    .populate({ path: "guideId", select: "name avatarUrl role" })
    .populate({ path: "userId", select: "name avatarUrl role" })
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .lean();

  const enriched = await Promise.all(
    threads.map(async (thread) => {
      const lastMessage = await ChatMessage.findOne({ threadId: thread._id })
        .sort({ createdAt: -1 })
        .lean();
      return {
        id: thread._id,
        event: thread.eventId ? { id: thread.eventId._id, title: thread.eventId.title } : null,
        guide: thread.guideId
          ? { id: thread.guideId._id, name: thread.guideId.name, avatarUrl: thread.guideId.avatarUrl, role: thread.guideId.role }
          : null,
        user: thread.userId
          ? { id: thread.userId._id, name: thread.userId.name, avatarUrl: thread.userId.avatarUrl, role: thread.userId.role }
          : null,
        lastMessage: lastMessage
          ? {
              id: lastMessage._id,
              text: lastMessage.text,
              senderId: lastMessage.senderId,
              senderRole: lastMessage.senderRole,
              createdAt: lastMessage.createdAt,
            }
          : null,
      };
    })
  );

  return res.json(successResponse({ threads: enriched }));
});

export const listMessages = asyncHandler(async (req, res) => {
  const { threadId } = req.params;
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 200, 1), 500);
  const thread = await ChatThread.findById(threadId).lean();
  if (!thread) throw new NotFoundError("Chat thread");
  if (!canAccessThread(thread, req.user.id)) throw new ForbiddenError("Not allowed to view this chat");

  const messages = await ChatMessage.find({ threadId })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();

  const payload = messages.map((msg) => ({
    id: msg._id,
    senderId: msg.senderId,
    senderRole: msg.senderRole,
    text: msg.text,
    createdAt: msg.createdAt,
  }));

  return res.json(successResponse({ messages: payload }));
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { threadId } = req.params;
  const text = req.body?.text?.trim();
  if (!text) throw new ValidationError("Message text is required");

  const thread = await ChatThread.findById(threadId).lean();
  if (!thread) throw new NotFoundError("Chat thread");
  if (!canAccessThread(thread, req.user.id)) throw new ForbiddenError("Not allowed to send messages");

  const message = await ChatMessage.create({
    threadId: thread._id,
    senderId: req.user.id,
    senderRole: req.user.role,
    text,
  });

  await ChatThread.findByIdAndUpdate(thread._id, { lastMessageAt: message.createdAt });

  return res.status(201).json(
    successResponse({
      id: message._id,
      senderId: message.senderId,
      senderRole: message.senderRole,
      text: message.text,
      createdAt: message.createdAt,
    })
  );
});
