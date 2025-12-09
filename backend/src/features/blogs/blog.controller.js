import BlogService from "./blog.service.js";
import { NotFoundError, ForbiddenError } from "../../shared/errors.js";
import { asyncHandler, successResponse } from "../../shared/utils.js";

export const createBlog = asyncHandler(async (req, res) => {
  const { title, content, images = [] } = req.body;
  const blog = await BlogService.create({
    title,
    content,
    images,
    author: req.user.id,
    likes: [],
    comments: [],
  });
  res.status(201).json(successResponse(blog, "Blog created"));
});

export const getAllBlogs = asyncHandler(async (req, res) => {
  const blogs = await BlogService.findAll();
  res.json(successResponse(blogs));
});

export const getBlogById = asyncHandler(async (req, res) => {
  const blog = await BlogService.findById(req.params.id);
  if (!blog) throw new NotFoundError("Blog");
  res.json(successResponse(blog));
});

export const updateBlog = asyncHandler(async (req, res) => {
  const blog = await BlogService.findById(req.params.id);
  if (!blog) throw new NotFoundError("Blog");
  const authorId = blog.author?._id || blog.author?.id || blog.author;
  const isOwner = authorId && String(authorId) === req.user.id;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) throw new ForbiddenError("Not allowed to edit this blog");
  const updated = await BlogService.update(req.params.id, req.body);
  res.json(successResponse(updated));
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await BlogService.findById(req.params.id);
  if (!blog) throw new NotFoundError("Blog");
  const authorId = blog.author?._id || blog.author?.id || blog.author;
  const isOwner = authorId && String(authorId) === req.user.id;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) throw new ForbiddenError("Not allowed to delete this blog");
  await BlogService.delete(req.params.id);
  res.json(successResponse(null, "Blog deleted"));
});

export const likeBlog = asyncHandler(async (req, res) => {
  const blog = await BlogService.toggleLike(req.params.id, req.user.id);
  if (!blog) throw new NotFoundError("Blog");
  res.json(successResponse(blog));
});

export const unlikeBlog = likeBlog;

export const addComment = asyncHandler(async (req, res) => {
  const blog = await BlogService.addComment(req.params.id, req.user.id, req.body.text);
  if (!blog) throw new NotFoundError("Blog");
  res.status(201).json(successResponse(blog));
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;
  const blog = await BlogService.findById(id);
  if (!blog) throw new NotFoundError("Blog");
  const comment = blog.comments.find((c) => String(c._id) === String(commentId));
  if (!comment) throw new NotFoundError("Comment");
  const isOwner = String(comment.user?._id || comment.user) === req.user.id;
  const authorId = blog.author?._id || blog.author?.id || blog.author;
  const isAuthor = authorId && String(authorId) === req.user.id;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAuthor && !isAdmin) throw new ForbiddenError("Not allowed to delete this comment");
  const updated = await BlogService.deleteComment(id, commentId);
  res.json(successResponse(updated));
});
