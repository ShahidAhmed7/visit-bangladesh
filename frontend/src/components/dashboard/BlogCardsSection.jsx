import { excerpt } from "../../utils/format.js";

const BlogCardsSection = ({ blogs = [], onDelete }) => (
  <section className="space-y-4 rounded-3xl bg-white p-6 shadow-lg md:p-8">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Stories</p>
        <h2 className="text-2xl font-bold text-slate-900">Your blog posts</h2>
        <p className="text-sm text-slate-600">Recent posts you’ve published.</p>
      </div>
      <button className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
        Write a Story
      </button>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {blogs.map((b) => (
          <div key={b.id} className="space-y-2 rounded-2xl bg-white p-4 shadow-md ring-1 ring-emerald-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{b.title}</h3>
              <span className="text-xs text-slate-500">{b.createdAt}</span>
            </div>
            <p className="text-sm text-slate-700">{excerpt(b.snippet, 160)}</p>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>❤️ {b.likes}</span>
              <span>💬 {b.comments}</span>
            </div>
            <div className="flex gap-2 text-xs font-semibold text-emerald-700">
              <button className="rounded-full border border-emerald-100 px-3 py-1">Edit</button>
              <button className="rounded-full border border-rose-200 px-3 py-1 text-rose-700 hover:bg-rose-50" onClick={() => onDelete?.(b)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
);

export default BlogCardsSection;
