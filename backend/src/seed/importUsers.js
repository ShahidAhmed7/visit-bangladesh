import bcrypt from "bcrypt";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import { users } from "./userSeed.js";

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

const importUsers = async () => {
  try {
    await connectDB();

    let inserted = 0;
    for (const u of users) {
      const existing = await User.findOne({ email: u.email.toLowerCase() });
      if (existing) {
        console.log(`Skipping existing user: ${u.email}`);
        continue;
      }
      const passwordHash = await bcrypt.hash(u.password, 10);
      await User.create({
        name: u.name,
        email: u.email.toLowerCase(),
        role: u.role || "regular",
        passwordHash,
      });
      inserted += 1;
    }
    console.log(`Inserted ${inserted} new users (existing preserved)`);
    console.log("Seed accounts:");
    users.forEach((u) => console.log(`- ${u.email} / ${u.password} (role: ${u.role || "regular"})`));
  } catch (err) {
    console.error("Failed to import users", err);
  } finally {
    await mongoose.connection.close();
  }
};

importUsers();
