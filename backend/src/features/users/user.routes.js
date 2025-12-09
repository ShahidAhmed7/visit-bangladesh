import express from "express";
import { getDashboard, getProfile } from "./user.controller.js";
import auth from "../../middleware/auth.js";
import requireRole from "../../middleware/requireRole.js";

const router = express.Router();

router.get("/me", auth, getProfile);
router.get("/dashboard", auth, requireRole("regular", "guide", "admin"), getDashboard);

export default router;
