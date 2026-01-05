import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import GuideApplication from "../src/models/GuideApplication.js";
import GuideReview from "../src/models/GuideReview.js";
import SpotReview from "../src/models/SpotReview.js";
import TouristSpot from "../src/models/TouristSpot.js";
import User from "../src/models/User.js";
import { authHeader, createTestUser, jsonRequest, startTestServer, stopTestServer } from "./testUtils.js";

let server;
let baseUrl;
let reviewer;
let guideUser;
let guideAppId;
let spotId;
const reviewIds = [];

before(async () => {
  ({ server, baseUrl } = await startTestServer());
  reviewer = await createTestUser(baseUrl, { role: "regular", namePrefix: "Reviewer" });
  guideUser = await createTestUser(baseUrl, { role: "guide", namePrefix: "Guide" });

  const guideApp = await GuideApplication.create({
    userId: guideUser.id,
    status: "approved",
    experienceText: "Approved guide for review tests.",
    yearsOfExperience: 3,
    languages: ["Bangla", "English"],
    regions: ["Dhaka"],
    specialties: ["History"],
    cv: {
      url: "https://example.com/cv.pdf",
      publicId: "cv-review-22301624",
      originalFilename: "cv.pdf",
      bytes: 1000,
      format: "pdf",
    },
  });
  guideAppId = guideApp._id.toString();

  const spot = await TouristSpot.create({
    name: "Review Spot",
    slug: `review-spot-${Date.now()}`,
    description: "Spot for review tests.",
    category: "Heritage",
    location: { division: "Dhaka", district: "Dhaka" },
    images: ["https://example.com/spot.jpg"],
    avgRating: 0,
    reviewCount: 0,
  });
  spotId = spot._id.toString();
});

after(async () => {
  if (reviewIds.length) {
    await SpotReview.deleteMany({ _id: { $in: reviewIds } });
    await GuideReview.deleteMany({ _id: { $in: reviewIds } });
  }
  if (spotId) {
    await TouristSpot.deleteMany({ _id: spotId });
  }
  if (guideAppId) {
    await GuideApplication.deleteMany({ _id: guideAppId });
  }
  const userIds = [reviewer?.id, guideUser?.id].filter(Boolean);
  if (userIds.length) {
    await User.deleteMany({ _id: { $in: userIds } });
  }
  await stopTestServer(server);
});

describe("Feature: Reviews (ID: 22301624)", () => {
  it("creates, updates, and deletes a spot review", async () => {
    const createRes = await jsonRequest(baseUrl, `/api/spots/${spotId}/reviews`, {
      method: "POST",
      headers: authHeader(reviewer.token),
      body: { rating: 5, comment: "Excellent spot." },
    });

    assert.equal(createRes.status, 201);
    const reviewId = createRes.body?.data?._id;
    assert.ok(reviewId);
    reviewIds.push(reviewId);

    const updateRes = await jsonRequest(baseUrl, `/api/spots/${spotId}/reviews/${reviewId}`, {
      method: "PUT",
      headers: authHeader(reviewer.token),
      body: { rating: 4, comment: "Updated comment." },
    });

    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body?.data?.rating, 4);

    const listRes = await jsonRequest(baseUrl, `/api/spots/${spotId}/reviews`, { method: "GET" });
    assert.equal(listRes.status, 200);
    const reviews = listRes.body?.data?.reviews || [];
    assert.ok(reviews.some((rev) => String(rev._id) === String(reviewId)));

    const deleteRes = await jsonRequest(baseUrl, `/api/spots/${spotId}/reviews/${reviewId}`, {
      method: "DELETE",
      headers: authHeader(reviewer.token),
    });
    assert.equal(deleteRes.status, 200);
  });

  it("creates, updates, and deletes a guide review", async () => {
    const createRes = await jsonRequest(baseUrl, `/api/guides/${guideAppId}/reviews`, {
      method: "POST",
      headers: authHeader(reviewer.token),
      body: { rating: 5, comment: "Great guide." },
    });

    assert.equal(createRes.status, 201);
    const reviewId = createRes.body?.data?._id;
    assert.ok(reviewId);
    reviewIds.push(reviewId);

    const updateRes = await jsonRequest(baseUrl, `/api/guides/${guideAppId}/reviews/${reviewId}`, {
      method: "PUT",
      headers: authHeader(reviewer.token),
      body: { rating: 3, comment: "Updated guide review." },
    });

    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body?.data?.rating, 3);

    const listRes = await jsonRequest(baseUrl, `/api/guides/${guideAppId}/reviews`, { method: "GET" });
    assert.equal(listRes.status, 200);
    const reviews = listRes.body?.data?.reviews || [];
    assert.ok(reviews.some((rev) => String(rev._id) === String(reviewId)));

    const deleteRes = await jsonRequest(baseUrl, `/api/guides/${guideAppId}/reviews/${reviewId}`, {
      method: "DELETE",
      headers: authHeader(reviewer.token),
    });
    assert.equal(deleteRes.status, 200);
  });
});
