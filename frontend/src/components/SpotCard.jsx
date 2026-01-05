import { useNavigate } from "react-router-dom";
import { HiLocationMarker } from "react-icons/hi";
import { resolveSpotImage } from "../utils/resolveSpotImage.js";

const truncate = (text = "", length = 80) =>
  text.length > length ? `${text.slice(0, length).trim()}...` : text;

const SpotCard = ({ spot }) => {
  if (!spot) return null;
  const navigate = useNavigate();
  const { _id, name, category, location, images = [], description, googleMapsUrl, avgRating, reviewCount } = spot;
  const imageSrc = resolveSpotImage(images[0]);
  const locationText = [location?.district, location?.division].filter(Boolean).join(", ");
  const ratingText = avgRating ? `${avgRating.toFixed(1)} (${reviewCount || 0})` : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/spots/${_id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/spots/${_id}`);
        }
      }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-md transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={imageSrc}
          alt={name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {category ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-200">
            {category}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
        {locationText ? (
          <a
            href={googleMapsUrl || "#"}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              if (!googleMapsUrl) e.preventDefault();
            }}
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            <HiLocationMarker className="h-4 w-4" />
            <span>{locationText}</span>
          </a>
        ) : null}
        {description ? (
          <p className="text-sm text-slate-600">{truncate(description, 90)}</p>
        ) : null}
        {ratingText ? (
          <div className="mt-2 text-sm text-slate-700">⭐ {ratingText}</div>
        ) : null}
        <div className="mt-auto pt-2">
          <span className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
            View Details
          </span>
        </div>
      </div>
    </div>
  );
};

export default SpotCard;
