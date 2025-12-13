import { excerpt } from "../../utils/format.js";

const ReviewsSection = ({ reviews }) => (
  <section className="space-y-4 rounded-3xl bg-white p-6 shadow-lg md:p-8">
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Reviews</p>
      <h2 className="text-2xl font-bold text-slate-900">Your reviews</h2>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {reviews.map((r) => (
        <div key={r.id} className="space-y-2 rounded-2xl bg-white p-4 shadow-md ring-1 ring-emerald-100">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">{r.type}</span>
            <span className="text-sm font-semibold text-slate-700">⭐ {r.rating}</span>
          </div>
          <div className="text-sm font-semibold text-slate-900">{r.target}</div>
          <div className="text-xs text-slate-500">{r.date}</div>
          <p className="text-sm text-slate-700">{excerpt(r.text, 160)}</p>
          <div className="flex gap-2 text-xs font-semibold text-emerald-700">
            <button className="rounded-full border border-emerald-100 px-3 py-1">Edit</button>
            <button className="rounded-full border border-emerald-100 px-3 py-1">Delete</button>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default ReviewsSection;
