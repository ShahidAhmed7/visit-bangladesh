import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export const signToken = (payload) => jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });

export const verifyToken = (token) => jwt.verify(token, config.JWT_SECRET);
