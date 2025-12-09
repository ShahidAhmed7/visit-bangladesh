import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.resolve(__dirname, "../../../.env");
const backendEnvPath = path.resolve(__dirname, "../../.env");

// Load root-level .env first (preferred), then backend-local if present
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}
if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
}

const envSchema = z.object({
  PORT: z.string().default("5000").transform((val) => parseInt(val, 10)),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (err) {
    console.error("❌ Invalid environment configuration:", err.errors);
    process.exit(1);
  }
};

export const config = parseEnv();
