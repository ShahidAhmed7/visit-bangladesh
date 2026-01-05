export const normalizeProfilePayload = (req, _res, next) => {
  if (typeof req.body.location === "string") {
    try {
      req.body.location = JSON.parse(req.body.location);
    } catch {
      // keep original value for validation error handling
    }
  }
  next();
};
