import TouristSpot from "../../models/TouristSpot.js";
import { NotFoundError } from "../../shared/errors.js";

// Helper to safely escape strings used in regex
const escapeRegex = (str = "") => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

class SpotsService {
  // Search spots with server-side filtering, sorting and pagination
  async search({ q, categories, division, district, minRating, sort, page = 1, limit = 12 }) {
    const filter = {};


    // Categories (comma separated): support multi-select
    if (categories) {
      const cats = categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
        .map((c) => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()); // normalize to Title Case to match enum
      if (cats.length) filter.category = { $in: cats };
    }

    // Location filters (case-insensitive partial match)
    if (division) filter["location.division"] = { $regex: new RegExp(escapeRegex(division), "i") };
    if (district) filter["location.district"] = { $regex: new RegExp(escapeRegex(district), "i") };

    // Minimum rating
    if (minRating !== undefined && minRating !== null && !Number.isNaN(Number(minRating))) {
      filter.avgRating = { $gte: Number(minRating) };
    }

    // Sorting
    let sortObj = { createdAt: -1 };
    if (sort === "rating_desc") sortObj = { avgRating: -1, reviewCount: -1 };
    else if (sort === "newest") sortObj = { createdAt: -1 };
    else if (sort === "most_reviewed") sortObj = { reviewCount: -1, avgRating: -1 };

    // Pagination
    page = Math.max(1, Number(page) || 1);
    limit = Math.min(100, Math.max(1, Number(limit) || 12));
    const skip = (page - 1) * limit;

    // Projection: return only public/safe fields
    const projection = {
      name: 1,
      slug: 1,
      description: 1,
      category: 1,
      location: 1,
      images: 1,
      googleMapsUrl: 1,
      avgRating: 1,
      reviewCount: 1,
      createdAt: 1,
    };

    // Execute queries; if q provided, prefer name prefix matches first (for instant, intuitive autocomplete-like behavior),
    // otherwise fall back to text search and then regex fallback.
    let data = [];
    let total = 0;

    // If a query is provided, try a prefix match on the name first (case-insensitive)
    if (q) {
      const prefixRegex = new RegExp(`^${escapeRegex(q)}`, "i");
      const prefixFilter = { ...filter, name: prefixRegex };
      const prefixTotal = await TouristSpot.countDocuments(prefixFilter);
      if (prefixTotal > 0) {
        total = prefixTotal;
        data = await TouristSpot.find(prefixFilter, projection).sort(sortObj).skip(skip).limit(limit).lean();
        const totalPages = Math.ceil(total / limit);
        return {
          data,
          meta: {
            page,
            limit,
            total,
            totalPages,
          },
        };
      }

      // No prefix matches — fall back to text search
      filter.$text = { $search: q };
    }

    try {
      if (filter.$text) {
        // Use text score for relevance when q was provided and no explicit sort given
        const sortByTextScore = sort === undefined || sort === null || sort === "";
        const cursor = TouristSpot.find(filter, { ...projection, score: { $meta: "textScore" } });
        if (sortByTextScore) cursor.sort({ score: { $meta: "textScore" } });
        else cursor.sort(sortObj);
        total = await TouristSpot.countDocuments(filter);
        data = await cursor.skip(skip).limit(limit).lean();
      } else {
        total = await TouristSpot.countDocuments(filter);
        data = await TouristSpot.find(filter, projection).sort(sortObj).skip(skip).limit(limit).lean();
      }
    } catch (err) {
      // Fallback: if $text isn't supported or errors, try regex search on name/description
      if (q) {
        const regex = { $regex: new RegExp(escapeRegex(q), "i") };
        const fallbackFilter = { ...filter, $or: [{ name: regex }, { description: regex }] };
        total = await TouristSpot.countDocuments(fallbackFilter);
        data = await TouristSpot.find(fallbackFilter, projection).sort(sortObj).skip(skip).limit(limit).lean();
      } else {
        throw err;
      }
    }

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findById(id) {
    const spot = await TouristSpot.findById(id).lean();
    if (!spot) throw new NotFoundError("Spot");
    return spot;
  }
}

export default new SpotsService();
