import mongoose from "mongoose";

const { Schema } = mongoose;

const ChatMessageSchema = new Schema(
  {
    threadId: { type: Schema.Types.ObjectId, ref: "ChatThread", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["regular", "guide", "admin", "system"], default: "regular" },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("ChatMessage", ChatMessageSchema);
