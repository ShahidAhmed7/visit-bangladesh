import SpotReview from "../../models/SpotReview.js";
import TouristSpot from "../../models/TouristSpot.js";
import { ForbiddenError, NotFoundError } from "../../shared/errors.js";
import { asyncHandler, successResponse } from "../../shared/utils.js";
import { recalculateSpotRating } from "./review.utils.js";

export const listSpotReviews = asyncHandler(async (req, res) => {
  const spotId = req.params.id;
  const spot = await TouristSpot.findById(spotId).lean();
  if (!spot) throw new NotFoundError("Spot");

  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);

  const reviews = await SpotReview.find({ spotId })
    .populate({ path: "userId", select: "name avatarUrl" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return res.json(successResponse({ reviews }));
});

export const createSpotReview = asyncHandler(async (req, res) => {
  const spotId = req.params.id;
  const spot = await TouristSpot.findById(spotId).lean();
  if (!spot) throw new NotFoundError("Spot");

  const existing = await SpotReview.findOne({ spotId, userId: req.user.id }).lean();
  if (existing) {
    return res.status(409).json({ message: "You already reviewed this spot" });
  }

  const review = await SpotReview.create({
    spotId,
    userId: req.user.id,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  await recalculateSpotRating(spotId);

  return res.status(201).json(successResponse(review, "Review added"));
});

export const updateSpotReview = asyncHandler(async (req, res) => {
  const { id: spotId, reviewId } = req.params;
  const review = await SpotReview.findOne({ _id: reviewId, spotId });
  if (!review) throw new NotFoundError("Review");

  if (review.userId.toString() !== req.user.id) {
    throw new ForbiddenError("You can only edit your own review");
  }

  review.rating = req.body.rating;
  review.comment = req.body.comment;
  const saved = await review.save();

  await recalculateSpotRating(spotId);

  return res.json(successResponse(saved, "Review updated"));
});

export const deleteSpotReview = asyncHandler(async (req, res) => {
  const { id: spotId, reviewId } = req.params;
  const review = await SpotReview.findOne({ _id: reviewId, spotId });
  if (!review) throw new NotFoundError("Review");

  if (review.userId.toString() !== req.user.id) {
    throw new ForbiddenError("You can only delete your own review");
  }

  await review.deleteOne();
  await recalculateSpotRating(spotId);

  return res.json(successResponse(null, "Review deleted"));
});
