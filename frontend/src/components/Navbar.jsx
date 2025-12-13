import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { HiUserCircle } from "react-icons/hi";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Blogs", to: "/blogs" },
    { label: "Events", to: "/events" },
    { label: "Spots", to: "/spots" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 transition-all ${
        scrolled ? "bg-white/90 shadow-md backdrop-blur" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Visit Bangladesh logo" className="h-14 w-auto md:h-16 transition-all" />
        </Link>
        <nav className="flex items-center gap-4 text-sm font-semibold text-slate-800">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-2 py-1 transition hover:text-emerald-600 ${
                  isActive ? "text-emerald-600 underline underline-offset-8 decoration-2" : ""
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {user ? (
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800"
            >
              <HiUserCircle className="h-6 w-6" />
              <span className="hidden sm:inline text-sm font-semibold">{user.name || "Profile"}</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden text-slate-800 hover:text-emerald-700 transition md:inline">
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-emerald-600 px-4 py-2 text-white shadow-md transition hover:bg-emerald-700"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
