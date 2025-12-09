import { HiPencilAlt } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const BlogSidebar = ({ blogs = [] }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const popular = blogs
    .slice()
    .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    .slice(0, 3);

  return (
    <aside className="space-y-5">
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50 px-5 py-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Start Writing</h3>
        <p className="mt-2 text-sm text-slate-700">Share your journeys, tips, and stories with the community.</p>
        {user ? (
          <button
            onClick={() => navigate("/blogs/new")}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <HiPencilAlt className="h-5 w-5" />
            Write a Story
          </button>
        ) : (
          <Link
            to="/login"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5"
          >
            Login to Start Writing
          </Link>
        )}
      </div>

      <div className="rounded-3xl border border-emerald-100 bg-white px-5 py-6 shadow-sm">
        <h4 className="text-base font-bold text-slate-900">Popular Stories</h4>
        <div className="mt-3 space-y-3">
          {popular.length === 0 ? (
            <p className="text-sm text-slate-600">No stories yet.</p>
          ) : (
            popular.map((b) => (
              <button
                key={b._id}
                onClick={() => navigate(`/blogs/${b._id}`)}
                className="block w-full rounded-2xl border border-emerald-50 bg-emerald-50/50 px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                {b.title}
                <div className="text-xs font-medium text-emerald-700">❤️ {b.likes?.length || 0} likes</div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-emerald-100 bg-white px-5 py-6 shadow-sm">
        <h4 className="text-base font-bold text-slate-900">Writing Tips</h4>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li>• Keep it personal and vivid.</li>
          <li>• Highlight local culture and hidden gems.</li>
          <li>• Add practical tips for travelers.</li>
        </ul>
      </div>
    </aside>
  );
};

export default BlogSidebar;
