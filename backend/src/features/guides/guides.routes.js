import express from "express";
import {
  followGuide,
  getGuideById,
  listGuideBlogs,
  listGuideEvents,
  listGuides,
  unfollowGuide,
} from "./guides.controller.js";
import { createGuideReview, deleteGuideReview, listGuideReviews, updateGuideReview } from "../reviews/guideReview.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createReviewSchema, updateReviewSchema } from "../reviews/review.validation.js";

const router = express.Router();

router.get("/", listGuides);
router.get("/:id", getGuideById);
router.get("/:id/events", listGuideEvents);
router.get("/:id/blogs", listGuideBlogs);
router.get("/:id/reviews", listGuideReviews);
router.post("/:id/reviews", requireAuth, validate(createReviewSchema), createGuideReview);
router.put("/:id/reviews/:reviewId", requireAuth, validate(updateReviewSchema), updateGuideReview);
router.delete("/:id/reviews/:reviewId", requireAuth, deleteGuideReview);
router.post("/:id/follow", requireAuth, followGuide);
router.delete("/:id/follow", requireAuth, unfollowGuide);

export default router;
