import { HiLocationMarker, HiOutlineBookmark, HiOutlineSparkles } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/format.js";
import { resolveBlogImage } from "../../utils/resolveSpotImage.js";

const typeMeta = {
  tour: { label: "Tour Event", className: "bg-emerald-50 text-emerald-700", icon: HiOutlineSparkles },
  festival: { label: "Festival", className: "bg-purple-50 text-purple-700", icon: HiOutlineSparkles },
};

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  if (!event) return null;
  const cover = resolveBlogImage(event.imageUrl);
  const meta = typeMeta[event.eventType] || typeMeta.tour;
  const Icon = meta.icon;
  return (
    <div
      onClick={() => navigate(`/events/${event._id}`)}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-44 w-full overflow-hidden">
        {cover ? (
          <img src={cover} alt={event.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-sm font-semibold text-emerald-700">No image</div>
        )}
        <span className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ring-1 ring-emerald-100 ${meta.className}`}>
          <Icon className="h-4 w-4" /> {meta.label}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-5 py-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
          <span>{event.createdBy?.name || "Guide/Admin"}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">{formatDate(event.startDate || event.createdAt)}</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700">{event.title}</h3>
        <p className="text-sm text-slate-600 line-clamp-2">{event.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2 text-sm font-semibold text-slate-700">
          <span className="inline-flex items-center gap-1 text-emerald-700">
            <HiLocationMarker className="h-4 w-4" />
            {[event.location?.district, event.location?.division].filter(Boolean).join(", ") || "Bangladesh"}
          </span>
          <span className="inline-flex items-center gap-1 text-amber-600">
            <HiOutlineBookmark className="h-4 w-4" />
            {(event.bookmarkedBy || []).length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
