import { Link } from "react-router-dom";

const GuideCard = ({ guide }) => {
  const avatarFallback = guide.name?.[0]?.toUpperCase() || "G";
  const ratingText = guide.reviewCount
    ? `Rating: ${guide.avgRating?.toFixed(1)} (${guide.reviewCount})`
    : "No reviews yet";

  return (
    <Link
      to={`/guides/${guide.id}`}
      className="group flex h-full flex-col rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-emerald-600 text-lg font-bold text-white shadow-sm">
          {guide.avatarUrl ? (
            <img src={guide.avatarUrl} alt={guide.name || "Guide"} className="h-full w-full object-cover" />
          ) : (
            avatarFallback
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{guide.name || "Unnamed guide"}</h3>
          <p className="text-xs text-slate-500">
            {guide.location?.city || "Bangladesh"}
            {guide.location?.country ? `, ${guide.location.country}` : ""}
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-600">
        {guide.bio || "This guide has not added a bio yet."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-emerald-700">
        {(guide.languages || []).slice(0, 3).map((lang) => (
          <span key={lang} className="rounded-full bg-emerald-50 px-3 py-1 font-semibold">
            {lang}
          </span>
        ))}
      </div>
      <div className="mt-4 text-xs font-semibold text-slate-700">{ratingText}</div>
      <span className="mt-4 text-xs font-semibold text-emerald-700 transition group-hover:text-emerald-800">
        View profile 
      </span>
    </Link>
  );
};

export default GuideCard;
