import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/apiClient.js";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const tabs = [
  { key: "traveller", label: "Register as Traveller", active: true },
  { key: "guide", label: "Register as Guide", active: false },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { handleAuthSuccess } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("traveller");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (activeTab !== "traveller") {
      setError("Guide registration coming soon.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/register", form);
      handleAuthSuccess(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/50 to-white text-slate-900">
      <Navbar />
      <main className="mx-auto flex max-w-6xl items-center justify-center px-4 pb-16 pt-24 md:px-6 md:pt-28">
        <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl">
          <div className="flex flex-col gap-4 bg-emerald-600 px-6 py-5 text-white md:px-8 md:py-6">
            <p className="text-sm uppercase tracking-wide">Create your account</p>
            <h1 className="text-2xl font-bold leading-tight">Join the explorers of Bangladesh</h1>
            <div className="flex flex-wrap gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeTab === tab.key ? "bg-white text-emerald-700 shadow-sm" : "bg-white/10 text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "traveller" ? (
            <form onSubmit={onSubmit} className="space-y-4 px-6 py-6 md:px-8 md:py-8">
              {error ? <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    required
                    className="mt-2 w-full rounded-2xl border border-emerald-100 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Ayesha Rahman"
                  />
                </div>
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
                  <p className="mt-2 text-xs text-slate-500">Use at least 8 characters.</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>

              <p className="text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
                  Login
                </Link>
              </p>
            </form>
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-10 text-center md:px-8">
              <p className="text-2xl font-bold text-emerald-700">Guide registration will be added soon.</p>
              <p className="mt-3 text-sm text-slate-600 max-w-xl">
                We&apos;re preparing a dedicated onboarding for guides. Stay tuned for the next update!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
