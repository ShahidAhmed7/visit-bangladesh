import { HiPencilAlt } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import heroImg from "../assets/images/tour-img08.jpg";
import { useAuth } from "../context/AuthContext.jsx";

const BlogHero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="relative h-[280px] w-full overflow-hidden md:h-[360px]">
      <img src={heroImg} alt="Bangladesh landscape" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      <div className="relative mx-auto flex h-full max-w-6xl items-center justify-between px-4 text-white md:px-6">
        <div className="max-w-2xl space-y-3">
          <p className="rounded-full bg-white/15 px-4 py-1 text-sm font-semibold tracking-wide text-emerald-100 ring-1 ring-white/30">
            Travel Stories
          </p>
          <h1 className="text-3xl font-bold md:text-5xl">Travel Stories & Guides</h1>
          <p className="text-sm text-emerald-50 md:text-base">
            Read and share journeys, tips, and experiences from travelers across Bangladesh.
          </p>
        </div>
        <div className="hidden md:block">
          {user ? (
            <button
              onClick={() => navigate("/blogs/new")}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <HiPencilAlt className="h-5 w-5" />
              Write a Story
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Sign in to write your story
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogHero;
