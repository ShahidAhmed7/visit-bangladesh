import mongoose from "mongoose";
import Blog from "../../models/Blog.js";

const basePopulate = [
  { path: "author", select: "name email role" },
  { path: "comments.user", select: "name email role" },
];

class BlogService {
  async create(data) {
    const blog = await Blog.create(data);
    return blog.populate(basePopulate);
  }

  async findAll(filters = {}) {
    return Blog.find(filters).sort({ createdAt: -1 }).populate(basePopulate).lean();
  }

  async findById(id) {
    return Blog.findById(id).populate(basePopulate).lean();
  }

  async update(id, data) {
    const blog = await Blog.findByIdAndUpdate(id, data, { new: true });
    return blog ? blog.populate(basePopulate) : null;
  }

  async delete(id) {
    return Blog.findByIdAndDelete(id);
  }

  async toggleLike(blogId, userId) {
    const blog = await Blog.findById(blogId);
    if (!blog) return null;
    const userIdObj = new mongoose.Types.ObjectId(userId);
    const isLiked = blog.likes.some((id) => id.equals(userIdObj));
    if (isLiked) {
      blog.likes = blog.likes.filter((id) => !id.equals(userIdObj));
    } else {
      blog.likes.push(userIdObj);
    }
    await blog.save();
    return blog.populate(basePopulate);
  }

  async addComment(blogId, userId, text) {
    const blog = await Blog.findById(blogId);
    if (!blog) return null;
    blog.comments.push({ user: userId, text });
    await blog.save();
    return blog.populate(basePopulate);
  }

  async deleteComment(blogId, commentId) {
    const blog = await Blog.findById(blogId);
    if (!blog) return null;
    const comment = blog.comments.id(commentId);
    if (!comment) return null;
    comment.deleteOne();
    await blog.save();
    return blog.populate(basePopulate);
  }
}

export default new BlogService();
