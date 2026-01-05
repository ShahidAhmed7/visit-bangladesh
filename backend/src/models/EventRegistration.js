import mongoose from "mongoose";

const { Schema } = mongoose;

const EventRegistrationSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 1, max: 120 },
    sex: { type: String, required: true, trim: true },
    peopleCount: { type: Number, required: true, min: 1, max: 5 },
    nidNumber: { type: String, required: true, trim: true },
    termsAccepted: { type: Boolean, required: true },
  },
  { timestamps: true }
);

EventRegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export default mongoose.model("EventRegistration", EventRegistrationSchema);
