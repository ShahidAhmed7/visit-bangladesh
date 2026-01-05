import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import Notification from "../src/models/Notification.js";
import User from "../src/models/User.js";
import { authHeader, createTestUser, jsonRequest, startTestServer, stopTestServer } from "./testUtils.js";

let server;
let baseUrl;
let user;
const notificationIds = [];

before(async () => {
  ({ server, baseUrl } = await startTestServer());
  user = await createTestUser(baseUrl, { role: "regular", namePrefix: "Notify" });

  const unread = await Notification.create({
    recipient: user.id,
    actor: user.id,
    type: "test_unread",
    title: "Unread Notification",
    message: "Unread test notification",
    link: "/test/unread",
    entityType: "test",
    entityId: user.id,
    isRead: false,
  });
  const read = await Notification.create({
    recipient: user.id,
    actor: user.id,
    type: "test_read",
    title: "Read Notification",
    message: "Read test notification",
    link: "/test/read",
    entityType: "test",
    entityId: user.id,
    isRead: true,
  });
  notificationIds.push(unread._id, read._id);
});

after(async () => {
  if (notificationIds.length) {
    await Notification.deleteMany({ _id: { $in: notificationIds } });
  }
  if (user?.id) {
    await User.deleteMany({ _id: user.id });
  }
  await stopTestServer(server);
});

describe("Feature: Notifications (ID: 23101234)", () => {
  it("lists notifications for a user", async () => {
    const res = await jsonRequest(baseUrl, "/api/notifications", {
      method: "GET",
      headers: authHeader(user.token),
    });

    assert.equal(res.status, 200);
    assert.equal(res.body?.status, "success");
    const notifications = res.body?.data?.notifications || [];
    assert.ok(notifications.length >= 2);
  });

  it("filters unread notifications", async () => {
    const res = await jsonRequest(baseUrl, "/api/notifications?unread=true", {
      method: "GET",
      headers: authHeader(user.token),
    });

    assert.equal(res.status, 200);
    const notifications = res.body?.data?.notifications || [];
    assert.ok(notifications.every((n) => n.isRead === false));
  });

  it("marks a notification as read", async () => {
    const targetId = notificationIds[0];
    const res = await jsonRequest(baseUrl, `/api/notifications/${targetId}/read`, {
      method: "PATCH",
      headers: authHeader(user.token),
    });

    assert.equal(res.status, 200);
    assert.equal(res.body?.data?.isRead, true);
  });

  it("marks all notifications as read", async () => {
    const res = await jsonRequest(baseUrl, "/api/notifications/read-all", {
      method: "PATCH",
      headers: authHeader(user.token),
    });

    assert.equal(res.status, 200);
    const unreadCount = await Notification.countDocuments({ recipient: user.id, isRead: false });
    assert.equal(unreadCount, 0);
  });
});
