import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import TouristSpot from "../models/TouristSpot.js";
import { touristSpots } from "./touristSpotsSeed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.resolve(__dirname, "../../../.env");
const backendEnvPath = path.resolve(__dirname, "../../.env");

if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
} else {
  dotenv.config();
}

const importSpots = async () => {
  try {
    await connectDB();
    await TouristSpot.deleteMany();
    const inserted = await TouristSpot.insertMany(touristSpots);
    console.log(`Imported ${inserted.length} tourist spots`);
  } catch (err) {
    console.error("Failed to import tourist spots", err);
  } finally {
    await mongoose.connection.close();
  }
};

importSpots();
