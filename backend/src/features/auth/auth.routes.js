import express from "express";
import { login, me, register } from "./auth.controller.js";
import authMiddleware from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { authLimiter } from "../../middleware/rateLimiter.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

const router = express.Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/me", authMiddleware, me);

export default router;
