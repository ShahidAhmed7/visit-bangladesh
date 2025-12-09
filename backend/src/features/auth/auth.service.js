import bcrypt from "bcrypt";
import User from "../../models/User.js";
import { UnauthorizedError, NotFoundError } from "../../shared/errors.js";

class AuthService {
  async register({ name, email, password }) {
    const existing = await User.findOne({ email });
    if (existing) throw new UnauthorizedError("Email already in use");
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role: "regular" });
    return user;
  }

  async login({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) throw new UnauthorizedError("Invalid credentials");
    const match = await user.comparePassword(password);
    if (!match) throw new UnauthorizedError("Invalid credentials");
    return user;
  }

  async me(userId) {
    const user = await User.findById(userId).select("-passwordHash");
    if (!user) throw new NotFoundError("User");
    return user;
  }
}

export default new AuthService();
