import { HiHeart, HiChatAlt2, HiTrash } from "react-icons/hi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { excerpt, formatDate } from "../utils/format.js";
import { resolveBlogImage } from "../utils/resolveSpotImage.js";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/apiClient.js";
import { showConfirmToast } from "../utils/toast.js";

const BlogCard = ({ blog, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  if (!blog) return null;

  const {
    _id,
    title,
    content,
    images = [],
    author,
    createdAt,
    likes = [],
    comments = [],
  } = blog;

  const cover = resolveBlogImage(images[0]);
  const authorName = author?.name || "Unknown author";
  const authorId =
    typeof author === "string" ? author : author?._id || author?.id;
  const likeCount = likes.length;
  const commentCount = comments.length;
  const isOwner = user && authorId && String(authorId) === String(user.id);
  const isAdmin = user?.role === "admin";

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!isOwner && !isAdmin) return;

    showConfirmToast("Delete this story? This cannot be undone.", async () => {
      try {
        await api.delete(`/api/blogs/${_id}`);
        toast.success("Story deleted");
        onDelete?.(_id);
      } catch (err) {
        console.error("Delete story failed", err);
        toast.error("Failed to delete story");
      }
    });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/blogs/${_id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/blogs/${_id}`);
        }
      }}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
      {cover ? (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={cover}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-200">
            Travel Story
          </span>
        </div>
      ) : null}
      {(isOwner || isAdmin) ? (
        <button
          onClick={handleDelete}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-rose-600 shadow-sm transition hover:bg-rose-50"
          title="Delete story"
        >
          <HiTrash className="h-4 w-4" />
        </button>
      ) : null}
      <div className="flex flex-1 flex-col gap-3 px-5 py-4 md:px-6 md:py-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
          <span>{authorName}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">{formatDate(createdAt)}</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 transition group-hover:text-emerald-700">{title}</h3>
        <p className="text-sm leading-relaxed text-slate-600">{excerpt(content, 180)}</p>
        <div className="mt-auto flex items-center justify-between pt-2 text-sm font-semibold text-slate-700">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <HiHeart className="h-5 w-5 text-rose-500" /> {likeCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <HiChatAlt2 className="h-5 w-5 text-emerald-600" /> {commentCount}
            </span>
          </div>
          <span className="text-emerald-700 group-hover:underline">Read more →</span>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
