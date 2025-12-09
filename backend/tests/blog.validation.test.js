import test from "node:test";
import assert from "node:assert";
import { createBlogSchema } from "../src/features/blogs/blog.validation.js";

test("blog validation accepts valid payload", () => {
  const { error, value } = createBlogSchema.validate({
    title: "Exploring Cox's Bazar",
    content: "A long-form story about the journey, over 20 characters.",
    images: ["https://example.com/photo.jpg"],
  });
  assert.ifError(error);
  assert.equal(value.title, "Exploring Cox's Bazar");
});

test("blog validation rejects short title/content with friendly message", () => {
  const { error } = createBlogSchema.validate({ title: "Hi", content: "short" });
  assert.ok(error, "should have validation error");
  const messages = error.details.map((d) => d.message).join(" ");
  assert.match(messages, /at least/i);
});
