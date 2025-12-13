import mongoose from "mongoose";

const { Schema } = mongoose;

const CommentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const EventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    eventType: {
      type: String,
      enum: ["festival", "tour"],
      required: true,
    },
    itinerary: { type: String, trim: true },
    price: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    location: {
      division: { type: String, trim: true },
      district: { type: String, trim: true },
      exactSpot: { type: String, trim: true },
    },
    imageUrl: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    interestedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    bookmarkedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [CommentSchema],
  },
  { timestamps: true }
);

EventSchema.index({ eventType: 1 });
EventSchema.index({ "location.division": 1, "location.district": 1 });

export default mongoose.model("Event", EventSchema);
