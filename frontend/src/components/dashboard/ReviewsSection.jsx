import { useState } from "react";
import RatingStars from "../RatingStars.jsx";
import { excerpt } from "../../utils/format.js";

const ReviewsSection = ({ reviews, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ rating: 0, comment: "" });
  const [savingId, setSavingId] = useState(null);

  const startEdit = (review) => {
    setEditingId(review.id);
    setDraft({ rating: review.rating || 0, comment: review.comment || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({ rating: 0, comment: "" });
  };

  const saveEdit = async (review) => {
    if (!onUpdate) return;
    setSavingId(review.id);
    const ok = await onUpdate(review, draft);
    if (ok) {
      setEditingId(null);
    }
    setSavingId(null);
  };

  const removeReview = async (review) => {
    if (!onDelete) return;
    setSavingId(review.id);
    const ok = await onDelete(review);
    if (ok) {
      setEditingId((prev) => (prev === review.id ? null : prev));
    }
    setSavingId(null);
  };

  return (
    <section className="space-y-4 rounded-3xl bg-white p-6 shadow-lg md:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Reviews</p>
        <h2 className="text-2xl font-bold text-slate-900">Your reviews</h2>
      </div>
      {reviews.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((r) => {
            const isEditing = editingId === r.id;
            const isSaving = savingId === r.id;
            return (
              <div key={r.id} className="space-y-2 rounded-2xl bg-white p-4 shadow-md ring-1 ring-emerald-100">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                    {r.type}
                  </span>
                  <span className="text-sm font-semibold text-slate-700">{r.rating ? `Rating: ${r.rating}` : "No rating"}</span>
                </div>
                <div className="text-sm font-semibold text-slate-900">{r.target}</div>
                <div className="text-xs text-slate-500">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</div>
                {isEditing ? (
                  <div className="space-y-2">
                    <RatingStars
                      value={draft.rating}
                      onChange={(rating) => setDraft((prev) => ({ ...prev, rating }))}
                      interactive
                      sizeClass="text-lg"
                    />
                    <textarea
                      value={draft.comment}
                      onChange={(event) => setDraft((prev) => ({ ...prev, comment: event.target.value }))}
                      rows={3}
                      className="w-full rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-slate-700">{excerpt(r.comment || "", 160)}</p>
                )}
                <div className="flex gap-2 text-xs font-semibold text-emerald-700">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => saveEdit(r)}
                        disabled={isSaving}
                        className="rounded-full bg-emerald-600 px-3 py-1 text-white disabled:opacity-70"
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={isSaving}
                        className="rounded-full border border-emerald-100 px-3 py-1 text-emerald-700 disabled:opacity-70"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(r)} className="rounded-full border border-emerald-100 px-3 py-1">
                        Edit
                      </button>
                      <button
                        onClick={() => removeReview(r)}
                        disabled={isSaving}
                        className="rounded-full border border-emerald-100 px-3 py-1 disabled:opacity-70"
                      >
                        {isSaving ? "Deleting..." : "Delete"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6 text-sm text-slate-600">No reviews yet.</div>
      )}
    </section>
  );
};

export default ReviewsSection;
