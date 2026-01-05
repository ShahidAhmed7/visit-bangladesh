import express from "express";
import {
  addComment,
  adminList,
  approveEvent,
  createEvent,
  deleteComment,
  getBookmarked,
  getEventById,
  getInterested,
  getGuideRegistrations,
  listEvents,
  registerForEvent,
  rejectEvent,
  toggleBookmark,
  toggleInterested,
  updateEvent,
} from "./events.controller.js";
import auth from "../../middleware/auth.js";
import requireRole from "../../middleware/requireRole.js";
import { validate } from "../../middleware/validate.js";
import { attachImages, upload } from "../../middleware/upload.js";
import { commentSchema, createEventSchema, registrationSchema, updateEventSchema } from "./events.validation.js";

const router = express.Router();

// Public listing (approved only)
router.get("/", listEvents);

// Authenticated lists before :id to avoid conflicts
router.get("/me/bookmarked/list", auth, getBookmarked);
router.get("/me/interested/list", auth, getInterested);
router.get("/me/registrations", auth, requireRole("guide", "admin"), getGuideRegistrations);
router.get("/admin/all/list", auth, requireRole("admin"), adminList);

router.get("/:id", getEventById);

// Authenticated actions
router.post("/", auth, upload.single("image"), attachImages, validate(createEventSchema), createEvent);
router.put("/:id", auth, upload.single("image"), attachImages, validate(updateEventSchema), updateEvent);
router.post("/:id/interested", auth, toggleInterested);
router.post("/:id/bookmark", auth, toggleBookmark);
router.post("/:id/register", auth, validate(registrationSchema), registerForEvent);
router.post("/:id/comments", auth, validate(commentSchema), addComment);
router.delete("/:id/comments/:commentId", auth, deleteComment);

// Admin actions on specific event
router.post("/:id/approve", auth, requireRole("admin"), approveEvent);
router.post("/:id/reject", auth, requireRole("admin"), rejectEvent);

export default router;
