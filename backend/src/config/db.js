import mongoose from "mongoose";
import { config } from "./index.js";

export const connectDB = async () => {
  const uri = config.MONGO_URI;
  if (!uri) {
    throw new Error("Missing MONGO_URI environment variable");
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error", err);
    process.exit(1);
  }
};
