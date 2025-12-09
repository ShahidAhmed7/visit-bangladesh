import { useEffect, useMemo, useState } from "react";
import { HiHeart, HiOutlineHeart, HiTrash } from "react-icons/hi";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDate } from "../utils/format.js";
import { resolveBlogImage } from "../utils/resolveSpotImage.js";
import { showConfirmToast } from "../utils/toast.js";
import toast from "react-hot-toast";
import Footer from "../components/Footer.jsx";
import { blogsAPI } from "../services/api/blogs.api.js";

const BlogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");

  const isLiked = useMemo(() => {
    if (!blog || !user) return false;
    return (blog.likes || []).map(String).includes(String(user.id));
  }, [blog, user]);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await blogsAPI.getById(id);
        setBlog(res.data?.data || res.data);
      } catch (err) {
        console.error("Failed to load blog", err);
        setError("Failed to load blog.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleLikeToggle = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const endpoint = isLiked ? "unlike" : "like";
      const res = await blogsAPI[endpoint](id);
      setBlog(res.data?.data || res.data);
    } catch (err) {
      console.error("Like failed", err);
      toast.error("Failed to update like");
    }
  };

  const handleDeleteBlog = async () => {
    showConfirmToast("Delete this blog? This cannot be undone.", async () => {
      try {
        await blogsAPI.delete(id);
        toast.success("Blog deleted");
        navigate("/blogs");
      } catch (err) {
        console.error("Delete blog failed", err);
        setError("Failed to delete blog.");
        toast.error("Failed to delete blog");
      }
    });
  };

  const handleAddComment = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!commentText.trim()) return;
    try {
      const res = await blogsAPI.addComment(id, commentText.trim());
      setBlog(res.data?.data || res.data);
      setCommentText("");
      toast.success("Comment added");
    } catch (err) {
      console.error("Comment failed", err);
      toast.error("Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await blogsAPI.deleteComment(id, commentId);
      setBlog(res.data?.data || res.data);
    } catch (err) {
      console.error("Delete comment failed", err);
      setError("Failed to delete comment.");
      toast.error("Failed to delete comment");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-24 md:px-6">Loading...</main>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-24 md:px-6">{error || "Blog not found."}</main>
      </div>
    );
  }

  const cover = resolveBlogImage(blog.images?.[0]);
  const authorName = blog.author?.name || "Unknown author";
  const isAuthor = user && blog.author && String(blog.author._id || blog.author.id) === String(user.id);
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-20 md:px-6 md:pt-24">
        <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg">
          {cover ? <img src={cover} alt={blog.title} className="h-80 w-full object-cover" /> : null}
          <div className="space-y-3 px-6 py-6 md:px-8 md:py-8">
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-700">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
                Travel Story
              </span>
              <span className="text-slate-500">{formatDate(blog.createdAt)}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-700">By {authorName}</span>
            </div>
            <h1 className="text-3xl font-bold leading-tight text-slate-900 md:text-4xl">{blog.title}</h1>
            <div className="prose prose-slate max-w-none text-slate-800">
              <p className="whitespace-pre-line leading-relaxed">{blog.content}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleLikeToggle}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                  isLiked
                    ? "border border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300"
                    : "border border-emerald-100 text-emerald-700 hover:border-emerald-300"
                }`}
              >
                {isLiked ? <HiHeart className="h-5 w-5 text-rose-500" /> : <HiOutlineHeart className="h-5 w-5" />}
                {isLiked ? "Liked" : "Like"} · {blog.likes?.length || 0}
              </button>
              <span className="text-sm font-semibold text-slate-600">{blog.comments?.length || 0} comments</span>
              {(isAuthor || isAdmin) ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/blogs/${id}/edit`)}
                    className="rounded-full border border-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteBlog}
                    className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm transition hover:border-rose-300"
                  >
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <section className="mt-8 space-y-4 rounded-3xl border border-emerald-100 bg-white px-6 py-6 shadow-md md:px-8 md:py-8">
          <h2 className="text-xl font-bold text-slate-900">Comments</h2>
          {user ? (
            <div className="space-y-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-emerald-100 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="Share your thoughts..."
              />
              <button
                onClick={handleAddComment}
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Post Comment
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
                Login
              </Link>{" "}
              to comment.
            </div>
          )}

          <div className="space-y-4">
            {blog.comments?.length ? (
              blog.comments.map((c) => {
                const commentUserId = c.user?._id || c.user?.id || c.user;
                const canDelete = user && (String(commentUserId) === String(user.id) || isAuthor || isAdmin);
                return (
                  <div
                    key={c._id}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-emerald-50 bg-emerald-50/50 px-4 py-3"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-slate-900">{c.user?.name || "User"}</div>
                      <div className="text-xs text-slate-500">{formatDate(c.createdAt)}</div>
                      <p className="text-sm text-slate-700">{c.text}</p>
                    </div>
                    {canDelete ? (
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        className="rounded-full p-2 text-rose-600 transition hover:bg-rose-50"
                        title="Delete comment"
                      >
                        <HiTrash className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-600">No comments yet. Be the first to share a thought.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetailPage;
