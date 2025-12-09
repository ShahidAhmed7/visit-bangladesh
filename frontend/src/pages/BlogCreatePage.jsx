import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { blogsAPI } from "../services/api/blogs.api.js";

const BlogCreatePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ title: "", content: "", images: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const imagesArr = form.images
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);
      const res = await blogsAPI.create({ title: form.title.trim(), content: form.content.trim(), images: imagesArr });
      toast.success("Story published");
      const blog = res.data?.data || res.data;
      navigate(`/blogs/${blog._id}`);
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      const detail = err.response?.data?.errors?.[0]?.message;
      const friendly = detail || apiMessage || "Failed to publish story";
      setError(friendly);
      toast.error(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-24 md:px-6 md:pt-28">
        <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg">
          <div className="bg-emerald-600 px-6 py-5 text-white md:px-8">
            <p className="text-sm uppercase tracking-wide">Create</p>
            <h1 className="text-2xl font-bold">Write a new story</h1>
          </div>
          <form onSubmit={onSubmit} className="space-y-4 px-6 py-6 md:px-8 md:py-8">
            {error ? <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            <div>
              <label className="text-sm font-semibold text-slate-700">Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={onChange}
                required
                className="mt-2 w-full rounded-2xl border border-emerald-100 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="A journey through the Sundarbans"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Content</label>
              <textarea
                name="content"
                rows={8}
                value={form.content}
                onChange={onChange}
                required
                className="mt-2 w-full rounded-2xl border border-emerald-100 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="Share your experience..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Image URLs (comma-separated, optional)</label>
              <input
                type="text"
                name="images"
                value={form.images}
                onChange={onChange}
                className="mt-2 w-full rounded-2xl border border-emerald-100 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="/assets/images/tour-img01.jpg, https://example.com/photo.jpg"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Publishing..." : "Publish Story"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-full border border-emerald-100 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogCreatePage;
