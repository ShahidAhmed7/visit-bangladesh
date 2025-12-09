import { useEffect, useMemo, useState } from "react";
import BlogCard from "../components/BlogCard.jsx";
import BlogHero from "../components/BlogHero.jsx";
import BlogSidebar from "../components/BlogSidebar.jsx";
import BlogTabs, { BlogTabsEnum } from "../components/BlogTabs.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/apiClient.js";

const BlogsPage = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [tab, setTab] = useState(BlogTabsEnum.ALL);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.get("/api/blogs");
        setBlogs(res.data || []);
      } catch (err) {
        console.error("Failed to load blogs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const filtered = useMemo(() => {
    let list = [...blogs];
    if (tab === BlogTabsEnum.MINE && user) {
      list = list.filter((b) => {
        const authorId = b.author?._id || b.author?.id;
        return authorId && user.id && String(authorId) === String(user.id);
      });
    }
    if (tab === BlogTabsEnum.LIKED && user) {
      list = list.filter((b) => Array.isArray(b.likes) && b.likes.map(String).includes(String(user.id)));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) => b.title?.toLowerCase().includes(q) || b.content?.toLowerCase().includes(q));
    }
    if (sort === "latest") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "oldest") list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sort === "liked") list.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    return list;
  }, [blogs, tab, search, sort, user]);

  const canSeeProtectedTab = tab === BlogTabsEnum.ALL || user;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="pt-16 md:pt-20">
        <BlogHero />

        <section className="mx-auto max-w-6xl px-4 pb-16 pt-8 md:px-6">
          <div className="grid gap-10 md:grid-cols-[2fr,1fr] md:gap-8">
            <div className="space-y-6">
              <BlogTabs tab={tab} setTab={setTab} search={search} setSearch={setSearch} sort={sort} setSort={setSort} />

              {!canSeeProtectedTab ? (
                <div className="rounded-3xl border border-emerald-100 bg-emerald-50 px-5 py-6 text-center text-emerald-800 shadow-sm">
                  <p className="text-lg font-semibold">Sign in to view this tab.</p>
                  <Link
                    to="/login"
                    className="mt-3 inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    Login
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-5">
            {loading ? (
              <p className="text-slate-600">Loading stories...</p>
            ) : filtered.length === 0 ? (
              <div className="rounded-3xl border border-emerald-100 bg-white px-6 py-10 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-800">No stories found.</p>
                <p className="text-sm text-slate-600">Try another tab or adjust your search.</p>
              </div>
            ) : (
              filtered.map((blog) => (
                <BlogCard
                  key={blog._id}
                  blog={blog}
                  onDelete={(idToRemove) => setBlogs((prev) => prev.filter((b) => b._id !== idToRemove))}
                />
              ))
            )}
          </div>
                </>
              )}
            </div>

            <BlogSidebar blogs={blogs} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogsPage;
