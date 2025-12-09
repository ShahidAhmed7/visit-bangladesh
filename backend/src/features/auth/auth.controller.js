import { signToken } from "../../utils/jwt.js";
import { asyncHandler, successResponse } from "../../shared/utils.js";
import { UnauthorizedError } from "../../shared/errors.js";
import AuthService from "./auth.service.js";

const buildAuthResponse = (user) => ({
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
  token: signToken({ id: user.id, role: user.role }),
});

export const register = asyncHandler(async (req, res) => {
  const user = await AuthService.register(req.body);
  res.status(201).json(successResponse(buildAuthResponse(user), "Registered"));
});

export const login = asyncHandler(async (req, res) => {
  const user = await AuthService.login(req.body);
  res.json(successResponse(buildAuthResponse(user), "Logged in"));
});

export const me = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const user = await AuthService.me(req.user.id);
  res.json(successResponse(user));
});
