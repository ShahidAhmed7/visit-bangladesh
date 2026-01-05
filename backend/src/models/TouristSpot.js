import mongoose from "mongoose";

const { Schema } = mongoose;

const TouristSpotSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true },
    category: {
      // Use capitalized categories for readability; seeds and API will use these values
      type: String,
      enum: ["Nature", "Heritage", "Beach", "Hill", "Spiritual"],
      required: true,
    },
    location: {
      division: { type: String, trim: true },
      district: { type: String, trim: true },
      upazila: { type: String, trim: true },
      address: { type: String, trim: true },
      lat: Number,
      lng: Number,
    },
    images: [{ type: String }],
    googleMapsUrl: { type: String, trim: true },
    // Aggregated rating info for quick sorting/filtering
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for efficient filtering & search:
// - Text index on `name` and `description` to support full-text `q` search (fast relevance scoring)
// - Index on `category` for category filters
// - Compound index on location fields for division/district lookups
// - Index on `avgRating` and `reviewCount` to optimize sort and range queries
TouristSpotSchema.index({ name: "text", description: "text" });
TouristSpotSchema.index({ category: 1 });
TouristSpotSchema.index({ "location.division": 1, "location.district": 1 });
TouristSpotSchema.index({ avgRating: -1 });
TouristSpotSchema.index({ reviewCount: -1 });

export default mongoose.model("TouristSpot", TouristSpotSchema);
