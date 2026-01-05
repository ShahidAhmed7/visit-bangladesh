import mongoose from "mongoose";

const { Schema } = mongoose;

const ChatThreadSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    guideId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

ChatThreadSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export default mongoose.model("ChatThread", ChatThreadSchema);
