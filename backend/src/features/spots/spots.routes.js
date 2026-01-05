import express from "express";
import { getAllSpots, getSpotById } from "./spots.controller.js";
import { createSpotReview, deleteSpotReview, listSpotReviews, updateSpotReview } from "../reviews/spotReview.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createReviewSchema, updateReviewSchema } from "../reviews/review.validation.js";

const router = express.Router();

router.get("/", getAllSpots);
router.get("/:id", getSpotById);
router.get("/:id/reviews", listSpotReviews);
router.post("/:id/reviews", requireAuth, validate(createReviewSchema), createSpotReview);
router.put("/:id/reviews/:reviewId", requireAuth, validate(updateReviewSchema), updateSpotReview);
router.delete("/:id/reviews/:reviewId", requireAuth, deleteSpotReview);

export default router;
