import mongoose from "mongoose";

const { Schema } = mongoose;

const SpotReviewSchema = new Schema(
  {
    spotId: { type: Schema.Types.ObjectId, ref: "TouristSpot", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

SpotReviewSchema.index({ spotId: 1, userId: 1 }, { unique: true });

export default mongoose.model("SpotReview", SpotReviewSchema);
