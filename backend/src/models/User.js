import bcrypt from "bcrypt";
import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["regular", "guide", "admin"], default: "regular" },
    phone: { type: String, trim: true },
    bio: { type: String, trim: true },
    avatarUrl: { type: String, trim: true },
    location: {
      city: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    favorites: [{ type: Schema.Types.ObjectId, ref: "TouristSpot" }],
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

export default mongoose.model("User", UserSchema);
