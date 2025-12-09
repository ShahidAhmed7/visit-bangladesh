import User from "../../models/User.js";
import { NotFoundError } from "../../shared/errors.js";

class UserService {
  async getProfile(userId) {
    const user = await User.findById(userId).select("-passwordHash");
    if (!user) throw new NotFoundError("User");
    return user;
  }
}

export default new UserService();
