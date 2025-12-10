import mongoose from "mongoose";

const { Schema } = mongoose;

const TouristSpotSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: ["nature", "heritage", "beach", "hill", "spiritual"],
      required: true,
    },
    location: {
      division: { type: String, trim: true },
      district: { type: String, trim: true },
      lat: Number,
      lng: Number,
    },
    images: [{ type: String }],
    googleMapsUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

TouristSpotSchema.index({ category: 1 });
TouristSpotSchema.index({ "location.division": 1, "location.district": 1 });

export default mongoose.model("TouristSpot", TouristSpotSchema);
