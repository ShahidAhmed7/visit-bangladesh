import winston from "winston";
import { config } from "./index.js";

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
  }),
];

if (config.NODE_ENV === "production") {
  transports.push(
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" })
  );
}

export const logger = winston.createLogger({
  level: config.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
  transports,
});
