import bcrypt from "bcrypt";
import User from "../../models/User.js";
import { NotFoundError, UnauthorizedError } from "../../shared/errors.js";

class UserService {
  async getProfile(userId) {
    const user = await User.findById(userId).select("-passwordHash");
    if (!user) throw new NotFoundError("User");
    return user;
  }

  async updateProfile(userId, payload) {
    const allowed = ["name", "phone", "bio", "avatarUrl", "location"];
    const update = {};
    allowed.forEach((key) => {
      if (payload[key] !== undefined) update[key] = payload[key];
    });
    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");
    if (!user) throw new NotFoundError("User");
    return user;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User");
    const matches = await user.comparePassword(currentPassword);
    if (!matches) throw new UnauthorizedError("Current password is incorrect");
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    return true;
  }
}

export default new UserService();
