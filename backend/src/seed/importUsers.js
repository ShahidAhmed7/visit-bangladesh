import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import { users } from "./userSeed.js";

dotenv.config();

const importUsers = async () => {
  try {
    await connectDB();
    await User.deleteMany({});

    const payload = await Promise.all(
      users.map(async (u) => ({
        name: u.name,
        email: u.email.toLowerCase(),
        role: "regular",
        passwordHash: await bcrypt.hash(u.password, 10),
      }))
    );

    const inserted = await User.insertMany(payload);
    console.log(`Imported ${inserted.length} users`);
    console.log("Test accounts:");
    users.forEach((u) => console.log(`- ${u.email} / ${u.password}`));
  } catch (err) {
    console.error("Failed to import users", err);
  } finally {
    await mongoose.connection.close();
  }
};

importUsers();
