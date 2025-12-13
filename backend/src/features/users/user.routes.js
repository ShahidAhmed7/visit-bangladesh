import express from "express";
import { changePassword, getDashboard, getProfile, updateProfile } from "./user.controller.js";
import auth from "../../middleware/auth.js";
import requireRole from "../../middleware/requireRole.js";
import { validate } from "../../middleware/validate.js";
import { changePasswordSchema, updateProfileSchema } from "./user.validation.js";

const router = express.Router();

router.get("/me", auth, getProfile);
router.put("/me", auth, validate(updateProfileSchema), updateProfile);
router.put("/me/password", auth, validate(changePasswordSchema), changePassword);
router.get("/dashboard", auth, requireRole("regular", "guide", "admin"), getDashboard);

export default router;
