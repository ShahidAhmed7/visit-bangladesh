import express from "express";
import requireAuth from "../../middleware/auth.js";
import { listMessages, listThreads, sendMessage } from "./chats.controller.js";

const router = express.Router();

router.get("/threads", requireAuth, listThreads);
router.get("/threads/:threadId/messages", requireAuth, listMessages);
router.post("/threads/:threadId/messages", requireAuth, sendMessage);

export default router;
