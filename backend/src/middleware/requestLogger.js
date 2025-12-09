import { logger } from "../config/logger.js";

const requestLogger = (req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, { path: req.originalUrl, method: req.method });
  next();
};

export default requestLogger;
