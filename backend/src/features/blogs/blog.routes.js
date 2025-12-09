import express from "express";
import {
  addComment,
  createBlog,
  deleteBlog,
  deleteComment,
  getAllBlogs,
  getBlogById,
  likeBlog,
  unlikeBlog,
  updateBlog,
} from "./blog.controller.js";
import auth from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { addCommentSchema, createBlogSchema, updateBlogSchema } from "./blog.validation.js";

const router = express.Router();

// Public
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);

// Protected
router.post("/", auth, validate(createBlogSchema), createBlog);
router.put("/:id", auth, validate(updateBlogSchema), updateBlog);
router.delete("/:id", auth, deleteBlog);
router.post("/:id/like", auth, likeBlog);
router.post("/:id/unlike", auth, unlikeBlog);
router.post("/:id/comment", auth, validate(addCommentSchema), addComment);
router.delete("/:id/comment/:commentId", auth, deleteComment);

export default router;
