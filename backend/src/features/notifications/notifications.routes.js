import express from "express";
import { markAllRead, markRead, listNotifications } from "./notifications.controller.js";
import auth from "../../middleware/auth.js";

const router = express.Router();

router.get("/", auth, listNotifications);
router.patch("/read-all", auth, markAllRead);
router.patch("/:id/read", auth, markRead);

export default router;
