import BlogService from "./blog.service.js";
import GuideApplication from "../../models/GuideApplication.js";
import User from "../../models/User.js";
import { NotFoundError, ForbiddenError } from "../../shared/errors.js";
import { asyncHandler, successResponse } from "../../shared/utils.js";
import { createNotification, createNotificationsForRecipients } from "../notifications/notifications.service.js";

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
  if (req.user.role === "guide") {
    const guideApp = await GuideApplication.findOne({ userId: req.user.id, status: "approved" })
      .select("_id")
      .lean();
    if (guideApp?._id) {
      const followers = await User.find({ followingGuides: guideApp._id }).select("_id").lean();
      const followerIds = followers.map((u) => u._id);
      await createNotificationsForRecipients(
        followerIds,
        {
          actor: req.user.id,
          type: "guide_blog_new",
          title: "New blog post",
          message: "A guide you follow published a new blog.",
          link: `/blogs/${blog._id}`,
          entityType: "blog",
          entityId: blog._id,
        },
        req.user.id
      );
    }
  }
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
  const before = await BlogService.findById(req.params.id);
  if (!before) throw new NotFoundError("Blog");
  const alreadyLiked = (before.likes || []).map(String).includes(String(req.user.id));
  const blog = await BlogService.toggleLike(req.params.id, req.user.id);
  if (!blog) throw new NotFoundError("Blog");
  const authorId = blog.author?._id || blog.author?.id || blog.author;
  if (!alreadyLiked && authorId && String(authorId) !== String(req.user.id)) {
    await createNotification({
      recipient: authorId,
      actor: req.user.id,
      type: "blog_like",
      title: "New like on your blog",
      message: "Someone liked your blog post.",
      link: `/blogs/${blog._id}`,
      entityType: "blog",
      entityId: blog._id,
    });
  }
  res.json(successResponse(blog));
});

export const unlikeBlog = likeBlog;

export const addComment = asyncHandler(async (req, res) => {
  const blog = await BlogService.addComment(req.params.id, req.user.id, req.body.text);
  if (!blog) throw new NotFoundError("Blog");
  const authorId = blog.author?._id || blog.author?.id || blog.author;
  if (authorId && String(authorId) !== String(req.user.id)) {
    await createNotification({
      recipient: authorId,
      actor: req.user.id,
      type: "blog_comment",
      title: "New comment on your blog",
      message: "Someone commented on your blog post.",
      link: `/blogs/${blog._id}`,
      entityType: "blog",
      entityId: blog._id,
    });
  }
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
