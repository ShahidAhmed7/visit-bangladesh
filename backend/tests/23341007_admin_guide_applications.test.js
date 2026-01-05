import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import GuideApplication from "../src/models/GuideApplication.js";
import User from "../src/models/User.js";
import { authHeader, createTestUser, jsonRequest, startTestServer, stopTestServer } from "./testUtils.js";

const runId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
let server;
let baseUrl;
let adminUser;
let applicantOne;
let applicantTwo;
const createdUserIds = [];
const createdApplicationIds = [];

const applyForGuide = async (token, label) => {
  const res = await jsonRequest(baseUrl, "/api/guide-applications", {
    method: "POST",
    headers: authHeader(token),
    body: {
      experienceText: `Guide experience ${label}`,
      yearsOfExperience: 2,
      languages: ["English", "Bangla"],
      regions: ["Dhaka"],
      specialties: ["History"],
      cv: {
        url: "https://example.com/cv.pdf",
        publicId: `cv-${label}`,
        originalFilename: "cv.pdf",
        bytes: 1024,
        format: "pdf",
      },
    },
  });

  assert.equal(res.status, 201);
  const appId = res.body?.data?._id;
  assert.ok(appId);
  createdApplicationIds.push(appId);
  return appId;
};

before(async () => {
  ({ server, baseUrl } = await startTestServer());
  adminUser = await createTestUser(baseUrl, { role: "admin", namePrefix: "Admin" });
  applicantOne = await createTestUser(baseUrl, { role: "regular", namePrefix: "Applicant" });
  applicantTwo = await createTestUser(baseUrl, { role: "regular", namePrefix: "Applicant" });
  createdUserIds.push(adminUser.id, applicantOne.id, applicantTwo.id);
});

after(async () => {
  if (createdApplicationIds.length) {
    await GuideApplication.deleteMany({ _id: { $in: createdApplicationIds } });
  }
  if (createdUserIds.length) {
    await User.deleteMany({ _id: { $in: createdUserIds } });
  }
  await stopTestServer(server);
});

describe("Feature: Admin Guide Applications (ID: 23341007)", () => {
  it("handles listing, review, and access control", async () => {
    const appIdOne = await applyForGuide(applicantOne.token, `app-one-${runId}`);
    const appIdTwo = await applyForGuide(applicantTwo.token, `app-two-${runId}`);

    const listRes = await jsonRequest(baseUrl, "/api/admin/guide-applications?status=pending", {
      method: "GET",
      headers: authHeader(adminUser.token),
    });

    assert.equal(listRes.status, 200);
    assert.equal(listRes.body?.status, "success");
    const apps = listRes.body?.data || [];
    assert.ok(apps.some((app) => String(app._id) === String(appIdOne)));
    assert.ok(apps.some((app) => String(app._id) === String(appIdTwo)));

    const detailRes = await jsonRequest(baseUrl, `/api/admin/guide-applications/${appIdOne}`, {
      method: "GET",
      headers: authHeader(adminUser.token),
    });

    assert.equal(detailRes.status, 200);
    assert.equal(detailRes.body?.status, "success");
    assert.equal(String(detailRes.body?.data?._id), String(appIdOne));

    const approveRes = await jsonRequest(baseUrl, `/api/admin/guide-applications/${appIdOne}/approve`, {
      method: "PATCH",
      headers: authHeader(adminUser.token),
      body: { adminNotes: "Approved by tests" },
    });

    assert.equal(approveRes.status, 200);
    assert.equal(approveRes.body?.status, "success");
    assert.equal(approveRes.body?.data?.application?.status, "approved");
    assert.equal(approveRes.body?.data?.user?.role, "guide");

    const rejectRes = await jsonRequest(baseUrl, `/api/admin/guide-applications/${appIdTwo}/reject`, {
      method: "PATCH",
      headers: authHeader(adminUser.token),
      body: { adminNotes: "Rejected by tests" },
    });

    assert.equal(rejectRes.status, 200);
    assert.equal(rejectRes.body?.status, "success");
    assert.equal(rejectRes.body?.data?.status, "rejected");

    const forbiddenRes = await jsonRequest(baseUrl, "/api/admin/guide-applications?status=pending", {
      method: "GET",
      headers: authHeader(applicantOne.token),
    });

    assert.equal(forbiddenRes.status, 403);
  });
});
