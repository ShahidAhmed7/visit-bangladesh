import Button from "../ui/Button.jsx";
import cn from "../../utils/cn.js";
import heroImg from "../../assets/images/pohela-boishakh-celebration-01.webp";

const EventsHero = ({ canCreate, onCreate, children }) => (
  <div className="relative overflow-hidden rounded-none bg-slate-900 shadow-xl md:mx-auto md:max-w-6xl md:rounded-[32px]">
    <img src={heroImg} alt="Events hero" className="absolute inset-0 h-full w-full object-cover opacity-70" />
    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/75 to-emerald-900/65" />
    <div className="relative flex flex-col gap-6 px-6 py-10 text-white md:px-10 md:py-14">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <p className="inline-flex w-fit items-center rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-100 ring-1 ring-white/30">
            Events & Festivals
          </p>
          <h1 className="max-w-4xl text-3xl font-bold md:text-5xl">Explore Bangladesh’s Most Exciting Events</h1>
          <p className="max-w-3xl text-sm text-emerald-50 md:text-base">
            Discover cultural festivals, guided tours, and celebrations happening across Bangladesh. Join, bookmark, and share your next adventure.
          </p>
        </div>
        {canCreate ? (
          <Button
            onClick={onCreate}
            variant="secondary"
            size="lg"
            className={cn("bg-white/90 text-emerald-700 shadow-lg hover:-translate-y-0.5 hover:shadow-xl")}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">+</span>
            Create Event
          </Button>
        ) : null}
      </div>
      {children}
    </div>
  </div>
);

export default EventsHero;
