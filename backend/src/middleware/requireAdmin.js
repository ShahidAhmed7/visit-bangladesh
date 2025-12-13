import { ForbiddenError } from "../shared/errors.js";

const requireAdmin = (req, _res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new ForbiddenError("Admin access required"));
  }
  return next();
};

export default requireAdmin;
