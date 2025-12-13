import express from "express";
import { requireAuth } from "../../middleware/auth.js";
import requireAdmin from "../../middleware/requireAdmin.js";
import { validate } from "../../middleware/validate.js";
import {
  applyForGuide,
  getMyApplications,
  adminListApplications,
  adminGetApplication,
  approveApplication,
  rejectApplication,
} from "./guideApplication.controller.js";
import { applyGuideSchema, adminReviewSchema } from "./guideApplication.validation.js";

const router = express.Router();

router.post("/guide-applications", requireAuth, validate(applyGuideSchema), applyForGuide);
router.get("/guide-applications/me", requireAuth, getMyApplications);
router.get("/admin/guide-applications", requireAuth, requireAdmin, adminListApplications);
router.get("/admin/guide-applications/:id", requireAuth, requireAdmin, adminGetApplication);
router.patch(
  "/admin/guide-applications/:id/approve",
  requireAuth,
  requireAdmin,
  validate(adminReviewSchema),
  approveApplication
);
router.patch(
  "/admin/guide-applications/:id/reject",
  requireAuth,
  requireAdmin,
  validate(adminReviewSchema),
  rejectApplication
);

export default router;
