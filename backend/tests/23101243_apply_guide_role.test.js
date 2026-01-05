import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import GuideApplication from "../src/models/GuideApplication.js";
import User from "../src/models/User.js";
import { authHeader, createTestUser, jsonRequest, startTestServer, stopTestServer } from "./testUtils.js";

let server;
let baseUrl;
let applicant;
const applicationIds = [];

before(async () => {
  ({ server, baseUrl } = await startTestServer());
  applicant = await createTestUser(baseUrl, { role: "regular", namePrefix: "Applicant" });
});

after(async () => {
  if (applicationIds.length) {
    await GuideApplication.deleteMany({ _id: { $in: applicationIds } });
  }
  if (applicant?.id) {
    await User.deleteMany({ _id: applicant.id });
  }
  await stopTestServer(server);
});

describe("Feature: Apply for Guide Role (ID: 23101234)", () => {
  it("submits a guide application", async () => {
    const res = await jsonRequest(baseUrl, "/api/guide-applications", {
      method: "POST",
      headers: authHeader(applicant.token),
      body: {
        experienceText: "I have guided tours for 2 years.",
        yearsOfExperience: 2,
        languages: ["Bangla", "English"],
        regions: ["Dhaka"],
        specialties: ["History"],
        cv: {
          url: "https://example.com/cv.pdf",
          publicId: "cv-apply-23101234",
          originalFilename: "cv.pdf",
          bytes: 2048,
          format: "pdf",
        },
      },
    });

    assert.equal(res.status, 201);
    assert.equal(res.body?.status, "success");
    const appId = res.body?.data?._id;
    assert.ok(appId);
    applicationIds.push(appId);
  });

  it("lists my applications", async () => {
    const res = await jsonRequest(baseUrl, "/api/guide-applications/me", {
      method: "GET",
      headers: authHeader(applicant.token),
    });

    assert.equal(res.status, 200);
    assert.equal(res.body?.status, "success");
    const apps = res.body?.data?.applications || [];
    assert.ok(apps.length >= 1);
  });

  it("rejects duplicate pending application", async () => {
    const res = await jsonRequest(baseUrl, "/api/guide-applications", {
      method: "POST",
      headers: authHeader(applicant.token),
      body: {
        experienceText: "Duplicate request",
        yearsOfExperience: 1,
        languages: ["Bangla"],
        regions: ["Dhaka"],
        specialties: ["Culture"],
        cv: {
          url: "https://example.com/cv-dup.pdf",
          publicId: "cv-apply-dup",
          originalFilename: "cv-dup.pdf",
          bytes: 1024,
          format: "pdf",
        },
      },
    });

    assert.equal(res.status, 409);
  });
});
