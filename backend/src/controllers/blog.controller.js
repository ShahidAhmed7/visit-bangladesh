import mongoose from "mongoose";
import Blog from "../models/Blog.js";

const basePopulate = [
  { path: "author", select: "name email role" },
  { path: "comments.user", select: "name email role" },
];

export const createBlog = async (req, res, next) => {
  try {
    const { title, content, images = [] } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }
    const blog = await Blog.create({
      title,
      content,
      images,
      author: req.user.id,
      likes: [],
      comments: [],
    });
    const populated = await blog.populate(basePopulate);
    return res.status(201).json(populated);
  } catch (err) {
    return next(err);
  }
};

export const getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .populate(basePopulate)
      .lean();
    return res.json(blogs);
  } catch (err) {
    return next(err);
  }
};

export const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(basePopulate).lean();
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    return res.json(blog);
  } catch (err) {
    return next(err);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    const isOwner = blog.author.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not allowed to edit this blog" });
    const { title, content, images } = req.body;
    if (title !== undefined) blog.title = title;
    if (content !== undefined) blog.content = content;
    if (images !== undefined) blog.images = images;
    await blog.save();
    const populated = await blog.populate(basePopulate);
    return res.json(populated);
  } catch (err) {
    return next(err);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    const isOwner = blog.author.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not allowed to delete this blog" });
    await blog.deleteOne();
    return res.json({ message: "Blog deleted" });
  } catch (err) {
    return next(err);
  }
};

export const likeBlog = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likes: userId } },
      { new: true }
    ).populate(basePopulate);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    return res.json(blog);
  } catch (err) {
    return next(err);
  }
};

export const unlikeBlog = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $pull: { likes: userId } },
      { new: true }
    ).populate(basePopulate);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    return res.json(blog);
  } catch (err) {
    return next(err);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text is required" });
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    blog.comments.push({ user: req.user.id, text });
    await blog.save();
    const populated = await blog.populate(basePopulate);
    return res.status(201).json(populated);
  } catch (err) {
    return next(err);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment id" });
    }
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    const comment = blog.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    const isOwner = comment.user.toString() === req.user.id;
    const isAuthor = blog.author.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAuthor && !isAdmin) {
      return res.status(403).json({ message: "Not allowed to delete this comment" });
    }
    comment.deleteOne();
    await blog.save();
    const populated = await blog.populate(basePopulate);
    return res.json(populated);
  } catch (err) {
    return next(err);
  }
};
