import { asyncHandler, successResponse } from "../../shared/utils.js";
import UserService from "./user.service.js";

export const getProfile = asyncHandler(async (req, res) => {
  const user = await UserService.getProfile(req.user.id);
  return res.json(successResponse(user));
});

export const getDashboard = asyncHandler(async (req, res) => {
  return res.json(successResponse({ message: `Dashboard data for ${req.user.id}`, role: req.user.role }));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await UserService.updateProfile(req.user.id, req.body);
  return res.json(successResponse(user, "Profile updated"));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await UserService.changePassword(req.user.id, currentPassword, newPassword);
  return res.json(successResponse(null, "Password updated"));
});
