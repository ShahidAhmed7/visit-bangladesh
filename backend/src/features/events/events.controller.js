import EventRegistration from "../../models/EventRegistration.js";
import ChatMessage from "../../models/ChatMessage.js";
import ChatThread from "../../models/ChatThread.js";
import GuideApplication from "../../models/GuideApplication.js";
import User from "../../models/User.js";
import { ForbiddenError, NotFoundError } from "../../shared/errors.js";
import { asyncHandler, successResponse } from "../../shared/utils.js";
import { createNotification, createNotificationsForRecipients } from "../notifications/notifications.service.js";
import EventsService from "./events.service.js";

const ensureImage = (req) => {
  const imageUrl = req.file?.path || req.body.imageUrl;
  return imageUrl;
};

const normalizeLocation = (body) => {
  let loc = {};
  if (typeof body.location === "string") {
    try {
      loc = JSON.parse(body.location);
    } catch {
      loc = {};
    }
  } else if (body.location) {
    loc = body.location;
  }
  ["division", "district", "exactSpot"].forEach((key) => {
    if (body[`location[${key}]`]) loc[key] = body[`location[${key}]`];
  });
  return loc;
};

const canViewNonApproved = (eventDoc, user) => {
  if (!eventDoc) return false;
  if (!user) return false;
  if (user.role === "admin") return true;
  const creatorId = eventDoc.createdBy?._id || eventDoc.createdBy?.id || eventDoc.createdBy;
  return creatorId && String(creatorId) === String(user.id);
};

export const createEvent = asyncHandler(async (req, res) => {
  const imageUrl = ensureImage(req);
  if (!imageUrl) throw new ForbiddenError("Image is required for events");

  const status = req.user.role === "admin" ? "approved" : "pending";
  const body = {
    ...req.body,
    imageUrl,
    status,
    createdBy: req.user.id,
    location: normalizeLocation(req.body),
  };
  const event = await EventsService.create(body);
  if (req.user.role === "guide" && status === "approved") {
    const guideApp = await GuideApplication.findOne({ userId: req.user.id, status: "approved" })
      .select("_id")
      .lean();
    if (guideApp?._id) {
      const followers = await User.find({ followingGuides: guideApp._id }).select("_id").lean();
      const followerIds = followers.map((u) => u._id);
      await createNotificationsForRecipients(
        followerIds,
        {
          actor: req.user.id,
          type: "guide_event_new",
          title: "New event posted",
          message: "A guide you follow posted a new event.",
          link: `/events/${event._id}`,
          entityType: "event",
          entityId: event._id,
        },
        req.user.id
      );
    }
  }
  res.status(201).json(successResponse(event, "Event created"));
});

export const listEvents = asyncHandler(async (req, res) => {
  const { type, division, district, status: statusQuery } = req.query;
  const isAdmin = req.user?.role === "admin";
  const status = isAdmin && statusQuery ? statusQuery : "approved";
  const filters = EventsService.buildFilters({ status, eventType: type, division, district });
  const events = await EventsService.list(filters);
  res.json(successResponse(events));
});

export const getEventById = asyncHandler(async (req, res) => {
  const event = await EventsService.findById(req.params.id);
  if (!event) throw new NotFoundError("Event");
  if (event.status !== "approved" && !canViewNonApproved(event, req.user)) {
    throw new ForbiddenError("Event not accessible");
  }
  let guideId = null;
  if (event.createdBy?.role === "guide") {
    const guideApp = await GuideApplication.findOne({ userId: event.createdBy._id, status: "approved" })
      .select("_id")
      .lean();
    guideId = guideApp?._id || null;
  }
  res.json(successResponse({ ...event, createdByGuideId: guideId }));
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await EventsService.findById(req.params.id);
  if (!event) throw new NotFoundError("Event");
  const isAdmin = req.user.role === "admin";
  const creatorId = event.createdBy?._id || event.createdBy?.id || event.createdBy;
  const isOwner = creatorId && String(creatorId) === String(req.user.id);
  if (!isAdmin && !isOwner) throw new ForbiddenError("Not allowed to edit this event");

  const imageUrl = ensureImage(req);
  const payload = { ...req.body };
  if (imageUrl) payload.imageUrl = imageUrl;
  payload.location = normalizeLocation(req.body);
  // Non-admin cannot self-approve/reject
  if (!isAdmin) {
    if (payload.status && payload.status !== "canceled") {
      delete payload.status;
    }
  }

  const updated = await EventsService.update(req.params.id, payload);
  const startChanged = payload.startDate && new Date(payload.startDate).getTime() !== new Date(event.startDate || 0).getTime();
  const endChanged = payload.endDate && new Date(payload.endDate).getTime() !== new Date(event.endDate || 0).getTime();
  const canceled = payload.status === "canceled" && event.status !== "canceled";
  if (startChanged || endChanged || canceled) {
    const regs = await EventRegistration.find({ eventId: event._id }).select("userId").lean();
    const recipientIds = regs.map((reg) => reg.userId);
    const notice = canceled
      ? {
          type: "event_canceled",
          title: "Event canceled",
          message: "An event you registered for has been canceled.",
        }
      : {
          type: "event_rescheduled",
          title: "Event date updated",
          message: "An event you registered for has updated dates.",
        };
    await createNotificationsForRecipients(
      recipientIds,
      {
        actor: req.user.id,
        ...notice,
        link: `/events/${event._id}`,
        entityType: "event",
        entityId: event._id,
      },
      req.user.id
    );
  }
  res.json(successResponse(updated));
});

export const approveEvent = asyncHandler(async (req, res) => {
  const updated = await EventsService.update(req.params.id, { status: "approved" });
  if (!updated) throw new NotFoundError("Event");
  if (updated.createdBy?.role === "guide") {
    const guideApp = await GuideApplication.findOne({ userId: updated.createdBy._id, status: "approved" })
      .select("_id")
      .lean();
    if (guideApp?._id) {
      const followers = await User.find({ followingGuides: guideApp._id }).select("_id").lean();
      const followerIds = followers.map((u) => u._id);
      await createNotificationsForRecipients(
        followerIds,
        {
          actor: updated.createdBy._id,
          type: "guide_event_new",
          title: "New event posted",
          message: "A guide you follow posted a new event.",
          link: `/events/${updated._id}`,
          entityType: "event",
          entityId: updated._id,
        },
        updated.createdBy._id
      );
    }
  }
  res.json(successResponse(updated, "Event approved"));
});

export const rejectEvent = asyncHandler(async (req, res) => {
  const updated = await EventsService.update(req.params.id, { status: "rejected" });
  if (!updated) throw new NotFoundError("Event");
  res.json(successResponse(updated, "Event rejected"));
});

export const toggleInterested = asyncHandler(async (req, res) => {
  const ev = await EventsService.findById(req.params.id);
  if (!ev) throw new NotFoundError("Event");
  if (ev.status !== "approved" && req.user.role !== "admin") throw new ForbiddenError("Event not approved");
  const alreadyInterested = (ev.interestedUsers || []).map(String).includes(String(req.user.id));
  const updated = await EventsService.toggleArrayField(req.params.id, req.user.id, "interestedUsers");
  if (!alreadyInterested) {
    const creatorId = ev.createdBy?._id || ev.createdBy?.id || ev.createdBy;
    if (creatorId && String(creatorId) !== String(req.user.id)) {
      await createNotification({
        recipient: creatorId,
        actor: req.user.id,
        type: "event_interest",
        title: "New event interest",
        message: "Someone marked interest in your event.",
        link: `/events/${ev._id}`,
        entityType: "event",
        entityId: ev._id,
      });
    }
  }
  res.json(successResponse(updated));
});

export const toggleBookmark = asyncHandler(async (req, res) => {
  const ev = await EventsService.findById(req.params.id);
  if (!ev) throw new NotFoundError("Event");
  if (ev.status !== "approved" && req.user.role !== "admin") throw new ForbiddenError("Event not approved");
  const alreadyBookmarked = (ev.bookmarkedBy || []).map(String).includes(String(req.user.id));
  const updated = await EventsService.toggleArrayField(req.params.id, req.user.id, "bookmarkedBy");
  if (!alreadyBookmarked) {
    const creatorId = ev.createdBy?._id || ev.createdBy?.id || ev.createdBy;
    if (creatorId && String(creatorId) !== String(req.user.id)) {
      await createNotification({
        recipient: creatorId,
        actor: req.user.id,
        type: "event_bookmark",
        title: "Event bookmarked",
        message: "Someone bookmarked your event.",
        link: `/events/${ev._id}`,
        entityType: "event",
        entityId: ev._id,
      });
    }
  }
  res.json(successResponse(updated));
});

export const addComment = asyncHandler(async (req, res) => {
  const ev = await EventsService.findById(req.params.id);
  if (!ev) throw new NotFoundError("Event");
  if (ev.status !== "approved" && req.user.role !== "admin") throw new ForbiddenError("Event not approved");
  const updated = await EventsService.addComment(req.params.id, req.user.id, req.body.text);
  const creatorId = ev.createdBy?._id || ev.createdBy?.id || ev.createdBy;
  if (creatorId && String(creatorId) !== String(req.user.id)) {
    await createNotification({
      recipient: creatorId,
      actor: req.user.id,
      type: "event_comment",
      title: "New comment on your event",
      message: "Someone commented on your event.",
      link: `/events/${ev._id}`,
      entityType: "event",
      entityId: ev._id,
    });
  }
  res.status(201).json(successResponse(updated));
});

export const deleteComment = asyncHandler(async (req, res) => {
  const ev = await EventsService.findById(req.params.id);
  if (!ev) throw new NotFoundError("Event");
  const comment = ev.comments.find((c) => String(c._id) === String(req.params.commentId));
  if (!comment) throw new NotFoundError("Comment");
  const isOwner = String(comment.user?._id || comment.user) === String(req.user.id);
  const creatorId = ev.createdBy?._id || ev.createdBy?.id || ev.createdBy;
  const isCreator = creatorId && String(creatorId) === String(req.user.id);
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isCreator && !isAdmin) throw new ForbiddenError("Not allowed to delete comment");
  const updated = await EventsService.deleteComment(req.params.id, req.params.commentId);
  res.json(successResponse(updated));
});

export const getBookmarked = asyncHandler(async (req, res) => {
  const filters = { status: "approved", bookmarkedBy: req.user.id };
  const docs = await EventsService.list(filters);
  res.json(successResponse(docs));
});

export const getInterested = asyncHandler(async (req, res) => {
  const filters = { status: "approved", interestedUsers: req.user.id };
  const docs = await EventsService.list(filters);
  res.json(successResponse(docs));
});

export const adminList = asyncHandler(async (req, res) => {
  const { status, type, division, district } = req.query;
  const filters = EventsService.buildFilters({ status, eventType: type, division, district });
  const docs = await EventsService.list(filters);
  res.json(successResponse(docs));
});

export const registerForEvent = asyncHandler(async (req, res) => {
  const event = await EventsService.findById(req.params.id);
  if (!event) throw new NotFoundError("Event");
  if (event.status !== "approved") throw new ForbiddenError("Event not approved");

  const existing = await EventRegistration.findOne({ eventId: event._id, userId: req.user.id }).lean();
  if (existing) {
    return res.status(409).json({ message: "You are already registered for this event" });
  }

  const registration = await EventRegistration.create({
    eventId: event._id,
    userId: req.user.id,
    fullName: req.body.fullName,
    email: req.body.email,
    contactNumber: req.body.contactNumber,
    age: req.body.age,
    sex: req.body.sex,
    peopleCount: req.body.peopleCount,
    nidNumber: req.body.nidNumber,
    termsAccepted: req.body.termsAccepted,
  });

  const guideId = event.createdBy?._id || event.createdBy;
  let chatThreadId = null;
  if (guideId) {
    let thread = await ChatThread.findOne({ eventId: event._id, userId: req.user.id });
    if (!thread) {
      thread = await ChatThread.create({
        eventId: event._id,
        userId: req.user.id,
        guideId,
        lastMessageAt: new Date(),
      });
    }
    chatThreadId = thread._id;

    const hasMessage = await ChatMessage.findOne({ threadId: thread._id }).select("_id").lean();
    if (!hasMessage) {
      const contactEmail = event.createdBy?.email || "Not available";
      const contactPhone = event.createdBy?.phone || "Not available";
      const welcomeText =
        `Thank you for registering for ${event.title}. The organizer will contact you via email or phone.\n` +
        "If you need to request a change or report an issue, please contact the organizer directly:\n" +
        `Email: ${contactEmail} | Phone: ${contactPhone}`;
      const message = await ChatMessage.create({
        threadId: thread._id,
        senderId: guideId,
        senderRole: "guide",
        text: welcomeText,
      });
      await ChatThread.findByIdAndUpdate(thread._id, { lastMessageAt: message.createdAt });
    }
  }

  res.status(201).json(successResponse({ registration, chatThreadId }, "Registration completed"));
});

export const getGuideRegistrations = asyncHandler(async (req, res) => {
  const events = await EventsService.list({ createdBy: req.user.id });
  if (!events.length) {
    return res.json(successResponse({ events: [] }));
  }

  const eventIds = events.map((event) => event._id);
  const registrations = await EventRegistration.find({ eventId: { $in: eventIds } })
    .sort({ createdAt: 1 })
    .lean();

  const registrationsByEvent = registrations.reduce((acc, reg) => {
    const key = String(reg.eventId);
    if (!acc[key]) acc[key] = [];
    acc[key].push({
      id: reg._id,
      userId: reg.userId,
      fullName: reg.fullName,
      email: reg.email,
      contactNumber: reg.contactNumber,
      age: reg.age,
      sex: reg.sex,
      peopleCount: reg.peopleCount,
      nidNumber: reg.nidNumber,
      termsAccepted: reg.termsAccepted,
      createdAt: reg.createdAt,
    });
    return acc;
  }, {});

  const payload = events.map((event) => ({
    id: event._id,
    title: event.title,
    imageUrl: event.imageUrl,
    startDate: event.startDate,
    endDate: event.endDate,
    eventType: event.eventType,
    location: event.location,
    status: event.status,
    registrations: registrationsByEvent[String(event._id)] || [],
  }));

  return res.json(successResponse({ events: payload }));
});
