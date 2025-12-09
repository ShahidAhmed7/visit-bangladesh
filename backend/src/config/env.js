import dotenv from "dotenv";

dotenv.config();

const getEnv = (key, fallback) => {
  const value = process.env[key];
  if (value === undefined || value === "") {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const port = parseInt(getEnv("PORT", "5000"), 10);
export const jwtSecret = getEnv("JWT_SECRET", "dev-secret");
export const jwtExpiresIn = getEnv("JWT_EXPIRES_IN", "1d");
