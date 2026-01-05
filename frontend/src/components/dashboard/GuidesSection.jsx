import { Link } from "react-router-dom";

const GuidesSection = ({ guides, onUnfollow }) => (
  <section className="space-y-4 rounded-3xl bg-white p-6 shadow-lg md:p-8">
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Guides</p>
      <h2 className="text-2xl font-bold text-slate-900">Followed guides</h2>
    </div>
    {guides.length ? (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => {
          const ratingText = guide.reviewCount
            ? `Rating: ${guide.avgRating?.toFixed(1)} (${guide.reviewCount})`
            : "No reviews yet";
          const city = guide.location?.city || "Bangladesh";
          return (
            <div key={guide.id} className="space-y-2 rounded-2xl bg-white p-4 shadow-md ring-1 ring-emerald-100">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-emerald-50 text-lg font-bold text-emerald-700">
                  {guide.avatarUrl ? (
                    <img src={guide.avatarUrl} alt={guide.name || "Guide"} className="h-full w-full object-cover" />
                  ) : (
                    guide.name?.[0]?.toUpperCase() || "G"
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{guide.name || "Guide"}</div>
                  <div className="text-xs text-slate-600">{city}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-emerald-700">
                {(guide.languages || []).slice(0, 3).map((lang) => (
                  <span key={lang} className="rounded-full bg-emerald-50 px-2 py-1 ring-1 ring-emerald-200">
                    {lang}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>{ratingText}</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700 ring-1 ring-emerald-100">
                  Following
                </span>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/guides/${guide.id}`}
                  className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm"
                >
                  View Guide
                </Link>
                <button
                  type="button"
                  onClick={() => onUnfollow?.(guide)}
                  className="rounded-full border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                >
                  Unfollow
                </button>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6 text-sm text-slate-600">
        You have not followed any guides yet.
      </div>
    )}
  </section>
);

export default GuidesSection;
