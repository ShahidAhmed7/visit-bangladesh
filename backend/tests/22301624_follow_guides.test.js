import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import GuideApplication from "../src/models/GuideApplication.js";
import User from "../src/models/User.js";
import { authHeader, createTestUser, jsonRequest, startTestServer, stopTestServer } from "./testUtils.js";

let server;
let baseUrl;
let follower;
let guideUser;
let guideAppId;

before(async () => {
  ({ server, baseUrl } = await startTestServer());
  follower = await createTestUser(baseUrl, { role: "regular", namePrefix: "Follower" });
  guideUser = await createTestUser(baseUrl, { role: "guide", namePrefix: "Guide" });

  const guideApp = await GuideApplication.create({
    userId: guideUser.id,
    status: "approved",
    experienceText: "Approved guide for follow tests.",
    yearsOfExperience: 4,
    languages: ["Bangla", "English"],
    regions: ["Chattogram"],
    specialties: ["Adventure"],
    cv: {
      url: "https://example.com/cv.pdf",
      publicId: "cv-follow-22301624",
      originalFilename: "cv.pdf",
      bytes: 1000,
      format: "pdf",
    },
  });
  guideAppId = guideApp._id.toString();
});

after(async () => {
  if (guideAppId) {
    await GuideApplication.deleteMany({ _id: guideAppId });
  }
  const userIds = [follower?.id, guideUser?.id].filter(Boolean);
  if (userIds.length) {
    await User.deleteMany({ _id: { $in: userIds } });
  }
  await stopTestServer(server);
});

describe("Feature: Follow Guides (ID: 22301624)", () => {
  it("follows and unfollows a guide", async () => {
    const followRes = await jsonRequest(baseUrl, `/api/guides/${guideAppId}/follow`, {
      method: "POST",
      headers: authHeader(follower.token),
    });

    assert.equal(followRes.status, 200);
    assert.equal(followRes.body?.data?.following, true);

    const listRes = await jsonRequest(baseUrl, "/api/users/me/followed-guides", {
      method: "GET",
      headers: authHeader(follower.token),
    });

    assert.equal(listRes.status, 200);
    const guides = listRes.body?.data?.guides || [];
    assert.ok(guides.some((g) => String(g.id) === String(guideAppId)));

    const unfollowRes = await jsonRequest(baseUrl, `/api/guides/${guideAppId}/follow`, {
      method: "DELETE",
      headers: authHeader(follower.token),
    });

    assert.equal(unfollowRes.status, 200);
    assert.equal(unfollowRes.body?.data?.following, false);
  });
});
