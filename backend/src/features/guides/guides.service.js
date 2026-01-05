import GuideApplication from "../../models/GuideApplication.js";
import { NotFoundError } from "../../shared/errors.js";

const buildGuide = (application) => {
  const user = application.userId || {};
  return {
    id: application._id,
    userId: user._id,
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    location: user.location,
    experienceText: application.experienceText,
    yearsOfExperience: application.yearsOfExperience,
    languages: application.languages || [],
    regions: application.regions || [],
    specialties: application.specialties || [],
    avgRating: application.avgRating || 0,
    reviewCount: application.reviewCount || 0,
  };
};

class GuidesService {
  async list({ page = 1, limit = 20 }) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (safePage - 1) * safeLimit;

    const query = { status: "approved" };

    const [applications, total] = await Promise.all([
      GuideApplication.find(query)
        .populate({ path: "userId", select: "name bio avatarUrl location" })
        .sort({ reviewedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      GuideApplication.countDocuments(query),
    ]);

    const guides = applications.map(buildGuide);
    const totalPages = Math.ceil(total / safeLimit);

    return {
      guides,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
      },
    };
  }

  async getById(id) {
    const application = await GuideApplication.findOne({ _id: id, status: "approved" })
      .populate({ path: "userId", select: "name bio avatarUrl location" })
      .lean();

    if (!application) throw new NotFoundError("Guide");

    return buildGuide(application);
  }
}

export default new GuidesService();
