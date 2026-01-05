import mongoose from "mongoose";
import GuideApplication from "../../models/GuideApplication.js";
import GuideReview from "../../models/GuideReview.js";
import SpotReview from "../../models/SpotReview.js";
import TouristSpot from "../../models/TouristSpot.js";

const toObjectId = (value) => new mongoose.Types.ObjectId(value);

export const recalculateSpotRating = async (spotId) => {
  const stats = await SpotReview.aggregate([
    { $match: { spotId: toObjectId(spotId) } },
    { $group: { _id: "$spotId", avgRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } },
  ]);

  const avgRating = stats[0]?.avgRating || 0;
  const reviewCount = stats[0]?.reviewCount || 0;

  await TouristSpot.findByIdAndUpdate(spotId, { avgRating, reviewCount });
};

export const recalculateGuideRating = async (guideId) => {
  const stats = await GuideReview.aggregate([
    { $match: { guideId: toObjectId(guideId) } },
    { $group: { _id: "$guideId", avgRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } },
  ]);

  const avgRating = stats[0]?.avgRating || 0;
  const reviewCount = stats[0]?.reviewCount || 0;

  await GuideApplication.findByIdAndUpdate(guideId, { avgRating, reviewCount });
};
