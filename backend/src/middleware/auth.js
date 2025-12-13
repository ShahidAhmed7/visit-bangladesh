import { verifyToken } from "../utils/jwt.js";
import { UnauthorizedError } from "../shared/errors.js";

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  let token;

  if (header && header.startsWith("Bearer ")) {
    token = header.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new UnauthorizedError("Authorization token missing"));
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    return next();
  } catch (err) {
    return next(new UnauthorizedError("Invalid or expired token"));
  }
};

export default requireAuth;
