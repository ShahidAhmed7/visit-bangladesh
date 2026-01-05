import GuideApplication from "../../models/GuideApplication.js";
import GuideReview from "../../models/GuideReview.js";
import { ForbiddenError, NotFoundError } from "../../shared/errors.js";
import { asyncHandler, successResponse } from "../../shared/utils.js";
import { createNotification } from "../notifications/notifications.service.js";
import { recalculateGuideRating } from "./review.utils.js";

export const listGuideReviews = asyncHandler(async (req, res) => {
  const guideId = req.params.id;
  const guide = await GuideApplication.findOne({ _id: guideId, status: "approved" }).lean();
  if (!guide) throw new NotFoundError("Guide");

  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);

  const reviews = await GuideReview.find({ guideId })
    .populate({ path: "userId", select: "name avatarUrl" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return res.json(successResponse({ reviews }));
});

export const createGuideReview = asyncHandler(async (req, res) => {
  const guideId = req.params.id;
  const guide = await GuideApplication.findOne({ _id: guideId, status: "approved" }).lean();
  if (!guide) throw new NotFoundError("Guide");

  const existing = await GuideReview.findOne({ guideId, userId: req.user.id }).lean();
  if (existing) {
    return res.status(409).json({ message: "You already reviewed this guide" });
  }

  const review = await GuideReview.create({
    guideId,
    userId: req.user.id,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  await recalculateGuideRating(guideId);
  if (guide.userId && String(guide.userId) !== String(req.user.id)) {
    await createNotification({
      recipient: guide.userId,
      actor: req.user.id,
      type: "guide_review",
      title: "New guide review",
      message: "Someone reviewed your guide profile.",
      link: `/guides/${guideId}`,
      entityType: "guide",
      entityId: guideId,
    });
  }

  return res.status(201).json(successResponse(review, "Review added"));
});

export const updateGuideReview = asyncHandler(async (req, res) => {
  const { id: guideId, reviewId } = req.params;
  const review = await GuideReview.findOne({ _id: reviewId, guideId });
  if (!review) throw new NotFoundError("Review");

  if (review.userId.toString() !== req.user.id) {
    throw new ForbiddenError("You can only edit your own review");
  }

  review.rating = req.body.rating;
  review.comment = req.body.comment;
  const saved = await review.save();

  await recalculateGuideRating(guideId);

  return res.json(successResponse(saved, "Review updated"));
});

export const deleteGuideReview = asyncHandler(async (req, res) => {
  const { id: guideId, reviewId } = req.params;
  const review = await GuideReview.findOne({ _id: reviewId, guideId });
  if (!review) throw new NotFoundError("Review");

  if (review.userId.toString() !== req.user.id) {
    throw new ForbiddenError("You can only delete your own review");
  }

  await review.deleteOne();
  await recalculateGuideRating(guideId);

  return res.json(successResponse(null, "Review deleted"));
});
