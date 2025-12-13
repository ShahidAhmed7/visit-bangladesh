import { useEffect, useMemo, useState } from "react";
import { HiCheckCircle, HiOutlineCalendar, HiOutlineCloudUpload, HiOutlineSparkles } from "react-icons/hi";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { eventsAPI } from "../services/api/events.api.js";
import { useAuth } from "../context/AuthContext.jsx";
import heroImg from "../assets/images/Mangal_Shobhajatra_in_Dhaka.jpg";

const steps = ["Basic Info", "Schedule & Pricing", "Media & Location", "Review & Publish"];

const WizardStep = ({ index, current, label }) => {
  const done = index < current;
  const active = index === current;
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
          done ? "bg-emerald-600 text-white" : active ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-200" : "bg-slate-100 text-slate-500"
        }`}
      >
        {done ? <HiCheckCircle className="h-5 w-5" /> : index + 1}
      </div>
      <span className={`text-sm font-semibold ${active ? "text-emerald-700" : "text-slate-500"}`}>{label}</span>
    </div>
  );
};

const EventWizardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [step, setStep] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [form, setForm] = useState({
    eventType: "",
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    itinerary: "",
    highlights: "",
    price: "",
    division: "",
    district: "",
    exactSpot: "",
  });

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await eventsAPI.getById(id);
        const ev = res.data?.data || res.data;
        setForm({
          eventType: ev.eventType || "",
          title: ev.title || "",
          tagline: ev.tagline || "",
          description: ev.description || "",
          startDate: ev.startDate ? ev.startDate.substring(0, 10) : "",
          endDate: ev.endDate ? ev.endDate.substring(0, 10) : "",
          itinerary: ev.itinerary || "",
          price: ev.price || "",
          division: ev.location?.division || "",
          district: ev.location?.district || "",
          exactSpot: ev.location?.exactSpot || "",
        });
      } catch (err) {
        toast.error("Failed to load event");
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [id]);

  const canProceed = useMemo(() => {
    if (step === 0) return form.eventType && form.title.trim() && form.description.trim();
    if (step === 1) {
      if (form.eventType === "tour") return form.startDate && form.endDate && form.price;
      return form.startDate; // festival can be single date
    }
    if (step === 2) return !!imageFile || !!id; // editing can skip new upload
    return true;
  }, [step, form, imageFile, id]);

  const handleNext = () => {
    if (!canProceed) {
      toast.error("Please complete required fields");
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!canProceed) {
      toast.error("Please complete required fields");
      return;
    }
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("eventType", form.eventType);
      payload.append("title", form.title.trim());
      payload.append("description", form.description.trim());
      if (form.itinerary) payload.append("itinerary", form.itinerary);
      if (form.highlights) payload.append("itinerary", `${form.itinerary ? form.itinerary + "\n" : ""}${form.highlights}`);
      if (form.price) payload.append("price", form.price);
      if (form.startDate) payload.append("startDate", form.startDate);
      if (form.endDate) payload.append("endDate", form.endDate);
      payload.append("location[division]", form.division);
      payload.append("location[district]", form.district);
      payload.append("location[exactSpot]", form.exactSpot);
      if (imageFile) payload.append("image", imageFile);

      const res = id ? await eventsAPI.update(id, payload) : await eventsAPI.create(payload);
      const ev = res.data?.data || res.data;
      toast.success(isAdmin ? "Event published" : "Submitted for review");
      navigate(`/events/${ev._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save event";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 pb-16 pt-24 md:px-6 md:pt-28">Loading...</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-24 md:px-6 md:pt-28">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-50 to-cyan-50 p-6 shadow-lg md:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{id ? "Edit Event" : "Create Event"}</p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">{id ? "Update your event" : "Craft a new event"}</h1>
          <p className="text-sm text-slate-700">Multi-step wizard to publish tours or festivals.</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex-1 rounded-3xl border border-emerald-100 bg-white/70 p-4 shadow-md">
              <p className="text-sm font-semibold text-emerald-700">Build an engaging event</p>
              <p className="text-xs text-slate-600">Upload a cover image, add dates, and publish for travelers.</p>
            </div>
            <div className="h-24 w-32 overflow-hidden rounded-2xl border border-emerald-100 shadow-md">
              <img src={heroImg} alt="Event hero" className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {steps.map((label, idx) => (
              <WizardStep key={label} index={idx} current={step} label={label} />
            ))}
          </div>
          <div className="mt-2 h-1 rounded-full bg-emerald-100">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg">
          <div className="p-6 md:p-8">
            {step === 0 && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {["tour", "festival"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setForm((f) => ({ ...f, eventType: type }))}
                      className={`flex items-start gap-3 rounded-2xl border px-4 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                        form.eventType === type ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <HiOutlineSparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{type === "tour" ? "Tour Event" : "Festival"}</p>
                        <p className="text-xs text-slate-600">
                          {type === "tour" ? "Trips with itinerary, pricing, dates." : "Cultural or seasonal festivals with dates."}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full rounded-2xl border border-emerald-100 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    placeholder="3-Day Bandarban Adventure"
                  />
                  {!form.title.trim() && <p className="text-xs text-amber-600">Title is required</p>}
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={6}
                    className="w-full rounded-2xl border border-emerald-100 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Describe the experience, highlights, and what to expect..."
                  />
                  {!form.description.trim() && <p className="text-xs text-amber-600">Description is required</p>}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Start date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                      className="w-full rounded-2xl border border-emerald-100 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">End date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                      className="w-full rounded-2xl border border-emerald-100 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>
                {form.eventType === "tour" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Price (BDT)</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      className="w-full rounded-2xl border border-emerald-100 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      placeholder="3000"
                    />
                  </div>
                ) : null}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Itinerary / Highlights</label>
                  <textarea
                    rows={5}
                    value={form.itinerary}
                    onChange={(e) => setForm((f) => ({ ...f, itinerary: e.target.value }))}
                    className="w-full rounded-2xl border border-emerald-100 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Day 1 - Arrival and sunset...\nDay 2 - Trekking..."
                  />
                </div>
                {form.eventType === "festival" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Festival highlights (one per line)</label>
                    <textarea
                      rows={4}
                      value={form.highlights}
                      onChange={(e) => setForm((f) => ({ ...f, highlights: e.target.value }))}
                      className="w-full rounded-2xl border border-emerald-100 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      placeholder="Live music\nLocal food stalls\nCultural performances"
                    />
                  </div>
                ) : null}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-700">Cover image</label>
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 px-6 py-10 text-center">
                  <HiOutlineCloudUpload className="h-10 w-10 text-emerald-500" />
                  <p className="mt-2 text-sm font-semibold text-slate-900">Drag & drop or click to upload</p>
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="mt-4" />
                  {imageFile ? <p className="mt-2 text-xs text-emerald-700">{imageFile.name}</p> : null}
                  {!imageFile && id ? <p className="mt-2 text-xs text-slate-500">Current image will be kept if you don’t upload a new one.</p> : null}
                  {!imageFile && !id ? <p className="mt-2 text-xs text-amber-600">Image is required.</p> : null}
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Division</label>
                    <input
                      value={form.division}
                      onChange={(e) => setForm((f) => ({ ...f, division: e.target.value }))}
                      className="w-full rounded-2xl border border-emerald-100 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      placeholder="Chattogram"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">District</label>
                    <input
                      value={form.district}
                      onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                      className="w-full rounded-2xl border border-emerald-100 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      placeholder="Bandarban"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Exact spot (optional)</label>
                    <input
                      value={form.exactSpot}
                      onChange={(e) => setForm((f) => ({ ...f, exactSpot: e.target.value }))}
                      className="w-full rounded-2xl border border-emerald-100 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      placeholder="Nilgiri"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
                  {isAdmin
                    ? "Publish now — your event will be live immediately."
                    : "Submit for review — admins will approve before it’s visible."}
                </div>
                <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    <HiOutlineSparkles className="h-4 w-4" /> {form.eventType || "Event"}
                  </div>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">{form.title || "Untitled event"}</h3>
                  <p className="text-sm text-slate-600">{form.description || "Description will appear here."}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-emerald-100">
                      <HiOutlineCalendar className="h-4 w-4" />
                      {form.startDate || "TBD"} {form.endDate ? `– ${form.endDate}` : ""}
                    </span>
                    {form.price ? <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700 ring-1 ring-amber-100">৳ {form.price}</span> : null}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-emerald-50 px-6 py-4">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="rounded-full border border-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 disabled:opacity-60"
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-70"
              >
                {loading ? "Submitting..." : isAdmin ? "Publish Event Now" : "Submit for Review"}
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EventWizardPage;
