import express from "express";
import {
  addSpotBookmark,
  changePassword,
  getBookmarks,
  getDashboard,
  getFollowedGuides,
  getMyRegistrations,
  getMyReviews,
  getProfile,
  removeSpotBookmark,
  updateProfile,
} from "./user.controller.js";
import auth from "../../middleware/auth.js";
import requireRole from "../../middleware/requireRole.js";
import { validate } from "../../middleware/validate.js";
import { changePasswordSchema, updateProfileSchema } from "./user.validation.js";
import { upload, attachAvatar } from "../../middleware/upload.js";
import { normalizeProfilePayload } from "./user.middleware.js";

const router = express.Router();

router.get("/me", auth, getProfile);
router.get("/me/followed-guides", auth, getFollowedGuides);
router.get("/me/bookmarks", auth, getBookmarks);
router.post("/me/bookmarks/spots/:spotId", auth, addSpotBookmark);
router.delete("/me/bookmarks/spots/:spotId", auth, removeSpotBookmark);
router.get("/me/reviews", auth, getMyReviews);
router.get("/me/registrations", auth, getMyRegistrations);
router.put(
  "/me",
  auth,
  upload.single("avatar"),
  attachAvatar,
  normalizeProfilePayload,
  validate(updateProfileSchema),
  updateProfile
);
router.put("/me/password", auth, validate(changePasswordSchema), changePassword);
router.get("/dashboard", auth, requireRole("regular", "guide", "admin"), getDashboard);

export default router;
