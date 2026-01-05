import Event from "../../models/Event.js";
import EventRegistration from "../../models/EventRegistration.js";
import GuideApplication from "../../models/GuideApplication.js";
import GuideReview from "../../models/GuideReview.js";
import SpotReview from "../../models/SpotReview.js";
import TouristSpot from "../../models/TouristSpot.js";
import User from "../../models/User.js";
import { NotFoundError } from "../../shared/errors.js";
import { asyncHandler, successResponse } from "../../shared/utils.js";
import UserService from "./user.service.js";

const mapGuideApplication = (application) => {
  const guideUser = application.userId || {};
  return {
    id: application._id,
    userId: guideUser._id,
    name: guideUser.name,
    bio: guideUser.bio,
    avatarUrl: guideUser.avatarUrl,
    location: guideUser.location,
    languages: application.languages || [],
    regions: application.regions || [],
    specialties: application.specialties || [],
    avgRating: application.avgRating || 0,
    reviewCount: application.reviewCount || 0,
  };
};

export const getProfile = asyncHandler(async (req, res) => {
  const user = await UserService.getProfile(req.user.id);
  return res.json(successResponse(user));
});

export const getDashboard = asyncHandler(async (req, res) => {
  return res.json(successResponse({ message: `Dashboard data for ${req.user.id}`, role: req.user.role }));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await UserService.updateProfile(req.user.id, req.body);
  return res.json(successResponse(user, "Profile updated"));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await UserService.changePassword(req.user.id, currentPassword, newPassword);
  return res.json(successResponse(null, "Password updated"));
});

export const getFollowedGuides = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("followingGuides").lean();
  const guideIds = user?.followingGuides || [];
  if (!guideIds.length) {
    return res.json(successResponse({ guides: [] }));
  }

  const applications = await GuideApplication.find({
    _id: { $in: guideIds },
    status: "approved",
  })
    .populate({ path: "userId", select: "name bio avatarUrl location" })
    .sort({ reviewedAt: -1, createdAt: -1 })
    .lean();

  const guides = applications.map(mapGuideApplication);

  return res.json(successResponse({ guides }));
});

export const getBookmarks = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("favorites").lean();
  const spotIds = user?.favorites || [];

  let spots = [];
  if (spotIds.length) {
    const spotDocs = await TouristSpot.find({ _id: { $in: spotIds } }).lean();
    const spotMap = new Map(spotDocs.map((spot) => [String(spot._id), spot]));
    spots = spotIds
      .map((id) => spotMap.get(String(id)))
      .filter(Boolean)
      .map((spot) => ({
        id: spot._id,
        name: spot.name,
        category: spot.category,
        district: spot.location?.district || "",
        division: spot.location?.division || "",
        rating: spot.avgRating || 0,
        image: spot.images?.[0] || "",
      }));
  }

  const eventDocs = await Event.find({ status: "approved", bookmarkedBy: req.user.id })
    .sort({ createdAt: -1 })
    .lean();
  const events = eventDocs.map((event) => ({
    id: event._id,
    title: event.title,
    imageUrl: event.imageUrl,
    startDate: event.startDate,
    endDate: event.endDate,
    eventType: event.eventType,
    location: event.location,
  }));

  return res.json(successResponse({ spots, events }));
});

export const addSpotBookmark = asyncHandler(async (req, res) => {
  const { spotId } = req.params;
  const spot = await TouristSpot.findById(spotId).lean();
  if (!spot) throw new NotFoundError("Spot");

  await User.findByIdAndUpdate(req.user.id, { $addToSet: { favorites: spotId } });
  return res.status(201).json(successResponse({ id: spotId }, "Bookmark added"));
});

export const removeSpotBookmark = asyncHandler(async (req, res) => {
  const { spotId } = req.params;
  const spot = await TouristSpot.findById(spotId).lean();
  if (!spot) throw new NotFoundError("Spot");

  await User.findByIdAndUpdate(req.user.id, { $pull: { favorites: spotId } });
  return res.json(successResponse({ id: spotId }, "Bookmark removed"));
});

export const getMyReviews = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const [spotReviews, guideReviews] = await Promise.all([
    SpotReview.find({ userId }).populate({ path: "spotId", select: "name" }).sort({ createdAt: -1 }).lean(),
    GuideReview.find({ userId })
      .populate({ path: "guideId", populate: { path: "userId", select: "name" } })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const mappedSpots = spotReviews.map((review) => ({
    id: review._id,
    reviewId: review._id,
    type: "Spot",
    target: review.spotId?.name || "Spot",
    targetId: review.spotId?._id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  }));

  const mappedGuides = guideReviews.map((review) => ({
    id: review._id,
    reviewId: review._id,
    type: "Guide",
    target: review.guideId?.userId?.name || "Guide",
    targetId: review.guideId?._id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  }));

  const reviews = [...mappedSpots, ...mappedGuides].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return res.json(successResponse({ reviews }));
});

export const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await EventRegistration.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .lean();

  if (!registrations.length) {
    return res.json(successResponse({ registrations: [] }));
  }

  const eventIds = registrations.map((reg) => reg.eventId);
  const events = await Event.find({ _id: { $in: eventIds } })
    .populate({ path: "createdBy", select: "name email phone" })
    .lean();
  const eventMap = new Map(events.map((event) => [String(event._id), event]));

  const payload = registrations
    .map((reg) => {
      const event = eventMap.get(String(reg.eventId));
      if (!event) return null;
      return {
        id: reg._id,
        event: {
          id: event._id,
          title: event.title,
          imageUrl: event.imageUrl,
          startDate: event.startDate,
          endDate: event.endDate,
          eventType: event.eventType,
          location: event.location,
          organizer: {
            name: event.createdBy?.name || "",
            email: event.createdBy?.email || "",
            phone: event.createdBy?.phone || "",
          },
        },
        peopleCount: reg.peopleCount,
        createdAt: reg.createdAt,
      };
    })
    .filter(Boolean);

  return res.json(successResponse({ registrations: payload }));
});
