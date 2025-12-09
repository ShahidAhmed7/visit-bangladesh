import { Link } from "react-router-dom";
import heroImg01 from "../assets/images/tour-img05.jpg";
import heroImg02 from "../assets/images/tour-img02.jpg";
import heroImg03 from "../assets/images/tour-img06.jpg";
import heroVideo from "../assets/images/hero-video.mp4";

const mediaCards = [
  { type: "image", src: heroImg01, alt: "Serene hills of Bangladesh" },
  { type: "video", src: heroVideo, alt: "River life in Bangladesh" },
  { type: "image", src: heroImg02, alt: "Boats on a tranquil river" },
  { type: "image", src: heroImg03, alt: "Misty greenery and hills" },
];

const HeroSection = () => {
  return (
    <section className="overflow-hidden bg-gradient-to-b from-white via-emerald-50/30 to-white pt-14 md:pt-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 md:flex-row md:items-center md:gap-14 md:px-6">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-emerald-50 shadow-md ring-1 ring-emerald-900/20">
            <span>Explore the Heart of Bangladesh</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            Experience Bangladesh A Land of Stories, Culture, and{" "}
            <span className="text-emerald-600">Endless Wonder</span>
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-gray-600 md:text-lg">
            From the misty hills of Bandarban to the tea gardens of Sylhet and the vibrant life along
            the rivers, Bangladesh invites you to discover its hidden gems. Every journey here becomes
            a memory — rich, colorful, and unforgettable.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700">
              Start Planning
            </button>
            <Link
              to="/spots"
              className="rounded-full border border-emerald-200 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:border-emerald-400 hover:text-emerald-800"
            >
              View Destinations
            </Link>
          </div>
        </div>

        <div className="flex flex-1 justify-center">
          <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5">
            {mediaCards.slice(0, 3).map((item) => (
              <div
                key={item.src}
                className="group relative aspect-[9/16] overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-lg transition transform hover:-translate-y-2 hover:shadow-2xl"
              >
                {item.type === "video" ? (
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    aria-label={item.alt}
                  >
                    <source src={item.src} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-emerald-900/0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
