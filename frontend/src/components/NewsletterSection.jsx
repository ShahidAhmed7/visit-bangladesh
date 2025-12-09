import { useState } from "react";
import toast from "react-hot-toast";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!email.trim()) {
      toast.error("Please enter an email");
      return;
    }
    toast.success("You are subscribed!");
    setEmail("");
  };

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
      <div className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 px-6 py-10 shadow-lg shadow-emerald-50 md:px-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Stay Updated With Bangladesh Travel Insights</h2>
            <p className="text-sm text-slate-700">
              Subscribe to our newsletter for travel stories, guides, events, and destination updates.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            <button
              onClick={handleSubmit}
              className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
