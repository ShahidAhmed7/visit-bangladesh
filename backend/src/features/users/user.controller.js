import { asyncHandler, successResponse } from "../../shared/utils.js";
import UserService from "./user.service.js";

export const getProfile = asyncHandler(async (req, res) => {
  const user = await UserService.getProfile(req.user.id);
  return res.json(successResponse(user));
});

export const getDashboard = asyncHandler(async (req, res) => {
  return res.json(successResponse({ message: `Dashboard data for ${req.user.id}`, role: req.user.role }));
});
