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
} from "../controllers/blog.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Public
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);

// Protected
router.post("/", auth, createBlog);
router.put("/:id", auth, updateBlog);
router.delete("/:id", auth, deleteBlog);
router.post("/:id/like", auth, likeBlog);
router.post("/:id/unlike", auth, unlikeBlog);
router.post("/:id/comment", auth, addComment);
router.delete("/:id/comment/:commentId", auth, deleteComment);

export default router;
