import mongoose from "mongoose";
import GuideApplication from "../../models/GuideApplication.js";
import User from "../../models/User.js";
import { AppError, NotFoundError } from "../../shared/errors.js";
import { asyncHandler, paginatedResponse, successResponse } from "../../shared/utils.js";

export const applyForGuide = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const existingPending = await GuideApplication.findOne({ userId, status: "pending" });
  if (existingPending) {
    return res.status(409).json({ message: "You already have a pending application" });
  }

  const application = await GuideApplication.create({
    userId,
    status: "pending",
    experienceText: req.body.experienceText,
    yearsOfExperience: req.body.yearsOfExperience,
    languages: req.body.languages,
    regions: req.body.regions,
    cv: req.body.cv,
  });

  res.status(201).json(successResponse(application, "Application submitted"));
});

export const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await GuideApplication.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .lean();

  res.json(
    successResponse({
      applications,
    })
  );
});

export const adminListApplications = asyncHandler(async (req, res) => {
  const allowedStatuses = ["pending", "approved", "rejected"];
  const status = req.query.status || "pending";
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status filter" });
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const query = { status };

  const [applications, total] = await Promise.all([
    GuideApplication.find(query)
      .populate({ path: "userId", select: "name email phone" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    GuideApplication.countDocuments(query),
  ]);

  res.json(paginatedResponse(applications, { page, limit, total }));
});

export const adminGetApplication = asyncHandler(async (req, res) => {
  const application = await GuideApplication.findById(req.params.id)
    .populate({ path: "userId", select: "name email phone role" })
    .lean();

  if (!application) {
    throw new NotFoundError("Application");
  }

  res.json(successResponse(application));
});

export const approveApplication = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  let updatedApplication;
  let updatedUser;

  await session.withTransaction(async () => {
    const application = await GuideApplication.findById(req.params.id).session(session);
    if (!application) throw new NotFoundError("Application");
    if (application.status !== "pending") throw new AppError("Application already reviewed", 400);

    application.status = "approved";
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    if (req.body.adminNotes !== undefined) application.adminNotes = req.body.adminNotes;

    updatedUser = await User.findByIdAndUpdate(
      application.userId,
      { role: "guide" },
      { new: true, session, runValidators: true }
    );
    if (!updatedUser) throw new NotFoundError("User");

    updatedApplication = await application.save({ session });
  });

  session.endSession();

  res.json(
    successResponse(
      {
        application: updatedApplication,
        user: { id: updatedUser.id, role: updatedUser.role },
      },
      "Application approved"
    )
  );
});

export const rejectApplication = asyncHandler(async (req, res) => {
  const application = await GuideApplication.findById(req.params.id);
  if (!application) throw new NotFoundError("Application");
  if (application.status !== "pending") throw new AppError("Application already reviewed", 400);

  application.status = "rejected";
  application.reviewedBy = req.user.id;
  application.reviewedAt = new Date();
  if (req.body.adminNotes !== undefined) application.adminNotes = req.body.adminNotes;

  const saved = await application.save();

  res.json(successResponse(saved, "Application rejected"));
});
