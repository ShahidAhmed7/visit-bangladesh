import User from "../models/User.js";

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (err) {
    return next(err);
  }
};

export const getDashboard = async (req, res) => {
  // Placeholder: in real app, aggregate dashboard data (bookings, favorites, etc.)
  return res.json({ message: `Dashboard data for ${req.user.id}`, role: req.user.role });
};
