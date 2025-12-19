import EventCard from "./EventCard.jsx";
import Skeleton from "../ui/Skeleton.jsx";
import EmptyState from "../ui/EmptyState.jsx";

const EventsGrid = ({ events = [], loading }) => {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-3xl" />
        ))}
      </div>
    );
  }

  if (!events || !events.length) {
    return (
      <EmptyState
        title="No events found"
        description="Try adjusting filters or check back later for new events and festivals."
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((ev) => (
        <EventCard key={ev._id} event={ev} />
      ))}
    </div>
  );
};

export default EventsGrid;
