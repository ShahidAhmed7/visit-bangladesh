import Blog from "../../models/Blog.js";
import Event from "../../models/Event.js";
import GuideApplication from "../../models/GuideApplication.js";
import User from "../../models/User.js";
import { NotFoundError } from "../../shared/errors.js";
import { asyncHandler, successResponse } from "../../shared/utils.js";
import GuidesService from "./guides.service.js";

export const listGuides = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await GuidesService.list({ page, limit });
  return res.json(successResponse(result));
});

export const getGuideById = asyncHandler(async (req, res) => {
  const guide = await GuidesService.getById(req.params.id);
  return res.json(successResponse(guide));
});

export const listGuideEvents = asyncHandler(async (req, res) => {
  const guide = await GuideApplication.findOne({ _id: req.params.id, status: "approved" }).lean();
  if (!guide) throw new NotFoundError("Guide");

  const events = await Event.find({ createdBy: guide.userId, status: "approved" })
    .select("title imageUrl startDate eventType")
    .sort({ startDate: 1, createdAt: -1 })
    .lean();

  return res.json(successResponse({ events }));
});

export const listGuideBlogs = asyncHandler(async (req, res) => {
  const guide = await GuideApplication.findOne({ _id: req.params.id, status: "approved" }).lean();
  if (!guide) throw new NotFoundError("Guide");

  const blogs = await Blog.find({ author: guide.userId })
    .select("title images createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return res.json(successResponse({ blogs }));
});

export const followGuide = asyncHandler(async (req, res) => {
  const guide = await GuideApplication.findOne({ _id: req.params.id, status: "approved" }).lean();
  if (!guide) throw new NotFoundError("Guide");

  await User.findByIdAndUpdate(req.user.id, { $addToSet: { followingGuides: guide._id } });

  return res.json(successResponse({ following: true }));
});

export const unfollowGuide = asyncHandler(async (req, res) => {
  const guide = await GuideApplication.findOne({ _id: req.params.id, status: "approved" }).lean();
  if (!guide) throw new NotFoundError("Guide");

  await User.findByIdAndUpdate(req.user.id, { $pull: { followingGuides: guide._id } });

  return res.json(successResponse({ following: false }));
});
