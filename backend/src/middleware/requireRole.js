import { ForbiddenError } from "../shared/errors.js";

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ForbiddenError("Forbidden: insufficient role"));
  }
  return next();
};

export default requireRole;
