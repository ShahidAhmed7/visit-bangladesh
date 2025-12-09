import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import TouristSpot from "../models/TouristSpot.js";
import { touristSpots } from "./touristSpotsSeed.js";

dotenv.config();

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
