import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api/auth.api.js";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const LoginPage = () => {
  const navigate = useNavigate();
  const { handleAuthSuccess } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      handleAuthSuccess(res.data?.data || res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white text-slate-900">
      <Navbar />
      <main className="mx-auto flex max-w-6xl items-center justify-center px-4 pb-16 pt-24 md:px-6 md:pt-28">
        <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl">
          <div className="bg-emerald-600 px-6 py-5 text-white md:px-8">
            <p className="text-sm uppercase tracking-wide">Welcome back</p>
            <h1 className="text-2xl font-bold">Login to continue</h1>
          </div>
          <form onSubmit={onSubmit} className="space-y-4 px-6 py-6 md:px-8 md:py-8">
            {error ? <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            <div>
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                required
                className="mt-2 w-full rounded-2xl border border-emerald-100 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                required
                className="mt-2 w-full rounded-2xl border border-emerald-100 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
            <p className="text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">
                Register
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
