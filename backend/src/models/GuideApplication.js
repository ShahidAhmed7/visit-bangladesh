import mongoose from "mongoose";

const { Schema } = mongoose;

const GuideApplicationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    experienceText: { type: String, required: true, trim: true },
    yearsOfExperience: { type: Number, min: 0 },
    languages: [{ type: String, trim: true }],
    regions: [{ type: String, trim: true }],
    specialties: [{ type: String, trim: true }],
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    cv: {
      url: { type: String, required: true, trim: true },
      publicId: { type: String, required: true, trim: true },
      originalFilename: { type: String, trim: true },
      bytes: { type: Number },
      format: { type: String, trim: true },
    },
    adminNotes: { type: String, trim: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

GuideApplicationSchema.index(
  { userId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);
GuideApplicationSchema.index({ createdAt: -1 });

export default mongoose.model("GuideApplication", GuideApplicationSchema);
