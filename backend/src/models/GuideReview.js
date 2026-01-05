import mongoose from "mongoose";

const { Schema } = mongoose;

const GuideReviewSchema = new Schema(
  {
    guideId: { type: Schema.Types.ObjectId, ref: "GuideApplication", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

GuideReviewSchema.index({ guideId: 1, userId: 1 }, { unique: true });

export default mongoose.model("GuideReview", GuideReviewSchema);
