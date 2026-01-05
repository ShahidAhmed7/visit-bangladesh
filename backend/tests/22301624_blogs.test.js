import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import Blog from "../src/models/Blog.js";
import User from "../src/models/User.js";
import { authHeader, createTestUser, jsonRequest, startTestServer, stopTestServer } from "./testUtils.js";

const runId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
let server;
let baseUrl;
let authorUser;
const createdBlogIds = [];
const createdUserIds = [];

const createBlog = async () => {
  const res = await jsonRequest(baseUrl, "/api/blogs", {
    method: "POST",
    headers: authHeader(authorUser.token),
    body: {
      title: `Test Blog ${runId}-${Date.now()}`,
      content: "Test content for blog entry with enough length.",
    },
  });

  assert.equal(res.status, 201);
  const blogId = res.body?.data?._id;
  assert.ok(blogId);
  createdBlogIds.push(blogId);
  return blogId;
};

before(async () => {
  ({ server, baseUrl } = await startTestServer());
  authorUser = await createTestUser(baseUrl, { role: "regular", namePrefix: "Author" });
  createdUserIds.push(authorUser.id);
});

after(async () => {
  if (createdBlogIds.length) {
    await Blog.deleteMany({ _id: { $in: createdBlogIds } });
  }
  if (createdUserIds.length) {
    await User.deleteMany({ _id: { $in: createdUserIds } });
  }
  await stopTestServer(server);
});

describe("Feature: Blogs (ID: 22301624)", () => {
  it("creates a new blog post", async () => {
    const blogId = await createBlog();
    assert.ok(blogId);
  });

  it("lists all blogs", async () => {
    const blogId = await createBlog();

    const res = await jsonRequest(baseUrl, "/api/blogs", { method: "GET" });
    assert.equal(res.status, 200);
    assert.equal(res.body?.status, "success");
    const blogs = res.body?.data || [];
    assert.ok(blogs.some((b) => String(b._id) === String(blogId)));
  });

  it("retrieves a blog by id", async () => {
    const blogId = await createBlog();

    const res = await jsonRequest(baseUrl, `/api/blogs/${blogId}`, { method: "GET" });
    assert.equal(res.status, 200);
    assert.equal(res.body?.status, "success");
    assert.equal(String(res.body?.data?._id), String(blogId));
  });

  it("updates a blog post", async () => {
    const blogId = await createBlog();
    const newTitle = `Updated Blog ${runId}`;

    const res = await jsonRequest(baseUrl, `/api/blogs/${blogId}`, {
      method: "PUT",
      headers: authHeader(authorUser.token),
      body: { title: newTitle, content: "Updated content with enough length." },
    });

    assert.equal(res.status, 200);
    assert.equal(res.body?.status, "success");
    assert.equal(res.body?.data?.title, newTitle);
  });

  it("likes and unlikes a blog post", async () => {
    const blogId = await createBlog();

    const likeRes = await jsonRequest(baseUrl, `/api/blogs/${blogId}/like`, {
      method: "POST",
      headers: authHeader(authorUser.token),
    });
    assert.equal(likeRes.status, 200);
    assert.ok((likeRes.body?.data?.likes || []).length >= 1);

    const unlikeRes = await jsonRequest(baseUrl, `/api/blogs/${blogId}/unlike`, {
      method: "POST",
      headers: authHeader(authorUser.token),
    });
    assert.equal(unlikeRes.status, 200);
    assert.equal((unlikeRes.body?.data?.likes || []).length, 0);
  });

  it("adds and deletes a comment", async () => {
    const blogId = await createBlog();

    const commentRes = await jsonRequest(baseUrl, `/api/blogs/${blogId}/comment`, {
      method: "POST",
      headers: authHeader(authorUser.token),
      body: { text: "Great blog post!" },
    });
    assert.equal(commentRes.status, 201);
    const comments = commentRes.body?.data?.comments || [];
    const commentId = comments[comments.length - 1]?._id;
    assert.ok(commentId);

    const deleteRes = await jsonRequest(baseUrl, `/api/blogs/${blogId}/comment/${commentId}`, {
      method: "DELETE",
      headers: authHeader(authorUser.token),
    });
    assert.equal(deleteRes.status, 200);
  });

  it("deletes a blog post", async () => {
    const blogId = await createBlog();

    const res = await jsonRequest(baseUrl, `/api/blogs/${blogId}`, {
      method: "DELETE",
      headers: authHeader(authorUser.token),
    });
    assert.equal(res.status, 200);
  });

  it("rejects unauthenticated blog creation", async () => {
    const res = await jsonRequest(baseUrl, "/api/blogs", {
      method: "POST",
      body: { title: "No Auth Blog", content: "This should fail." },
    });
    assert.equal(res.status, 401);
  });

  it("validates required fields", async () => {
    const res = await jsonRequest(baseUrl, "/api/blogs", {
      method: "POST",
      headers: authHeader(authorUser.token),
      body: { content: "Missing title should fail." },
    });
    assert.equal(res.status, 400);
  });
});
