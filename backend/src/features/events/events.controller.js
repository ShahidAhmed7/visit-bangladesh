import { ForbiddenError, NotFoundError } from "../../shared/errors.js";
import { asyncHandler, successResponse } from "../../shared/utils.js";
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
  res.json(successResponse(event));
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
  if (!isAdmin) delete payload.status;

  const updated = await EventsService.update(req.params.id, payload);
  res.json(successResponse(updated));
});

export const approveEvent = asyncHandler(async (req, res) => {
  const updated = await EventsService.update(req.params.id, { status: "approved" });
  if (!updated) throw new NotFoundError("Event");
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
  const updated = await EventsService.toggleArrayField(req.params.id, req.user.id, "interestedUsers");
  res.json(successResponse(updated));
});

export const toggleBookmark = asyncHandler(async (req, res) => {
  const ev = await EventsService.findById(req.params.id);
  if (!ev) throw new NotFoundError("Event");
  if (ev.status !== "approved" && req.user.role !== "admin") throw new ForbiddenError("Event not approved");
  const updated = await EventsService.toggleArrayField(req.params.id, req.user.id, "bookmarkedBy");
  res.json(successResponse(updated));
});

export const addComment = asyncHandler(async (req, res) => {
  const ev = await EventsService.findById(req.params.id);
  if (!ev) throw new NotFoundError("Event");
  if (ev.status !== "approved" && req.user.role !== "admin") throw new ForbiddenError("Event not approved");
  const updated = await EventsService.addComment(req.params.id, req.user.id, req.body.text);
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
