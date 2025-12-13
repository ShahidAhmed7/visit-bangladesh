import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HiCheckCircle, HiOutlineCloudUpload, HiOutlineDocumentText, HiOutlineSparkles } from "react-icons/hi";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { guideApplicationsAPI } from "../services/api/guideApplications.api.js";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_GUIDE === "true";

const specialtiesOptions = ["Nature", "Heritage", "Food", "Photography", "Family trips"];
const regionsOptions = ["Dhaka", "Sylhet", "Chattogram", "Khulna", "Rajshahi", "Barishal", "Rangpur"];
const languagesOptions = ["Bangla", "English", "Hindi", "Arabic", "Chinese"];

const ApplyForGuidePage = () => {
  const { user } = useAuth();
  const [loadingExisting, setLoadingExisting] = useState(!USE_MOCK);
  const [existingApplication, setExistingApplication] = useState(null);
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | pending | rejected | approved
  const [upload, setUpload] = useState(null);
  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    city: user?.location?.city || "",
    languages: user?.languages || ["Bangla", "English"],
    regions: [],
    specialties: [],
    years: 2,
    experienceText: "",
    confirm: false,
  });

  useEffect(() => {
    if (user?.name) {
      setForm((prev) => ({ ...prev, fullName: user.name, phone: user.phone || "", city: user.location?.city || "" }));
    }
  }, [user]);

  useEffect(() => {
    const fetchExisting = async () => {
      if (USE_MOCK || !user) {
        setLoadingExisting(false);
        return;
      }
      try {
        setLoadingExisting(true);
        const res = await guideApplicationsAPI.getMine();
        const apps = res.data?.data?.applications || res.data?.applications || [];
        if (apps.length) {
          const latest = apps[0];
          setExistingApplication(latest);
          setStatus(latest.status);
          setSubmitted(latest.status === "pending" || latest.status === "approved");
          if (latest.cv?.url) {
            setUpload({
              name: latest.cv.originalFilename || "Uploaded CV",
              size: latest.cv.bytes,
              url: latest.cv.url,
              format: latest.cv.format,
            });
          }
        }
      } catch (err) {
        // if unauthorized, redirect to login prompt below
      } finally {
        setLoadingExisting(false);
      }
    };
    fetchExisting();
  }, [user]);

  const toggleChip = (key, value) => {
    setForm((prev) => {
      const exists = prev[key].includes(value);
      const next = exists ? prev[key].filter((v) => v !== value) : [...prev[key], value];
      return { ...prev, [key]: next };
    });
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    if (USE_MOCK) {
      setTimeout(() => {
        setUpload({ name: file.name, size: file.size, url: "#", format: file.name.split(".").pop(), file });
        setUploading(false);
        setProgress(100);
      }, 300);
      return;
    }
    setUpload({ name: file.name, size: file.size, file, format: file.name.split(".").pop() });
    setUploading(false);
    setProgress(100);
    toast.success("CV ready to upload");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!upload) {
      toast.error("Upload your CV before submitting");
      return;
    }
    if (!form.confirm) {
      toast.error("Please confirm the information is accurate");
      return;
    }

    if (USE_MOCK) {
      setSubmitted(true);
      setStatus("pending");
      setExistingApplication({
        status: "pending",
        submittedAt: new Date().toISOString(),
        cvUrl: upload.url,
        experienceText: form.experienceText,
      });
      toast.success("Application submitted (mock)");
      return;
    }

    try {
      const payload = new FormData();
      payload.append("experienceText", form.experienceText);
      payload.append("yearsOfExperience", form.years);
      form.languages.forEach((lang) => payload.append("languages[]", lang));
      form.regions.forEach((region) => payload.append("regions[]", region));
      payload.append("cv", upload.file);

      const res = await guideApplicationsAPI.apply(payload);
      const app = res.data?.data || res.data;
      setExistingApplication(app);
      setSubmitted(true);
      setStatus("pending");
      toast.success("Application submitted");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit";
      toast.error(msg);
    }
  };

  const charCount = form.experienceText.length;
  const progressPercent = useMemo(() => Math.round((step / 4) * 100), [step]);

  const stepsMeta = [
    { id: 1, label: "Profile basics" },
    { id: 2, label: "Experience" },
    { id: 3, label: "Upload CV" },
    { id: 4, label: "Review & submit" },
  ];

  const renderStep = () => {
    if (loadingExisting) {
      return (
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-md">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-56 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="h-16 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-16 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>
      );
    }

    if (submitted || status === "pending") {
      return (
        <div className="space-y-4 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-emerald-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <HiCheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">Application submitted</p>
              <p className="text-sm text-slate-600">
                Status: {status === "pending" ? "Pending review (1–3 days)" : status}
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-700">
            We’ll email you after review. You can track this from your profile under “Guide Application Status.”
          </p>
          <div className="flex gap-3">
            <Link
              to="/profile"
              className="inline-flex flex-1 items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Go to Profile
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                setStatus("idle");
                setStep(1);
              }}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Submit another
            </button>
          </div>
        </div>
      );
    }

    if (status === "pending") {
      return (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          You already have a pending application. Please wait for admin review.
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-emerald-100">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Step {step} of 4</h3>
              <p className="text-sm text-slate-600">Complete the steps to submit your application.</p>
            </div>
            <div className="w-32 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {stepsMeta.map((s) => (
              <div
                key={s.id}
                className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold ring-1 ${
                  step === s.id ? "bg-emerald-600 text-white ring-emerald-600" : step > s.id ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-slate-50 text-slate-600 ring-slate-200"
                }`}
              >
                <span className="h-6 w-6 rounded-full bg-white/20 text-center text-[11px] leading-6 text-white">{s.id}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-800">Full Name</label>
              <input
                value={form.fullName}
                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:bg-white"
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-800">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:bg-white"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800">City</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:bg-white"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-800">Languages</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {languagesOptions.map((lang) => (
                  <button
                    type="button"
                    key={lang}
                    onClick={() => toggleChip("languages", lang)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${
                      form.languages.includes(lang)
                        ? "bg-emerald-600 text-white ring-emerald-600"
                        : "bg-slate-100 text-slate-700 ring-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-800">Years of experience</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={form.years}
                  onChange={(e) => setForm((prev) => ({ ...prev, years: Number(e.target.value) }))}
                  className="mt-2 w-full accent-emerald-600"
                />
                <div className="mt-1 text-xs text-slate-600">{form.years} years</div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800">Regions covered</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {regionsOptions.map((region) => (
                    <button
                      type="button"
                      key={region}
                      onClick={() => toggleChip("regions", region)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${
                        form.regions.includes(region)
                          ? "bg-emerald-600 text-white ring-emerald-600"
                          : "bg-slate-100 text-slate-700 ring-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-800">Specialties</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {specialtiesOptions.map((spec) => (
                  <button
                    type="button"
                    key={spec}
                    onClick={() => toggleChip("specialties", spec)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${
                      form.specialties.includes(spec)
                        ? "bg-emerald-600 text-white ring-emerald-600"
                        : "bg-slate-100 text-slate-700 ring-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-800">Experience summary</label>
              <textarea
                required
                value={form.experienceText}
                onChange={(e) => setForm((prev) => ({ ...prev, experienceText: e.target.value }))}
                rows={4}
                placeholder="I have guided... I specialize in..."
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:bg-white"
              />
              <div className="text-right text-xs text-slate-500">{charCount} / 800</div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div
              className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-6 text-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleUpload(file);
              }}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-600 ring-1 ring-emerald-100">
                <HiOutlineCloudUpload className="h-7 w-7" />
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900">Upload your CV (PDF/DOCX)</p>
              <p className="text-xs text-emerald-700">Drag & drop or choose a file. Max 10MB.</p>
              <label className="mt-3 inline-block cursor-pointer rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
                Choose file
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files?.[0])}
                />
              </label>
              {uploading && (
                <div className="mt-3 w-full rounded-full bg-white">
                  <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
              {upload && !uploading && (
                <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-left shadow-sm ring-1 ring-emerald-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <HiOutlineDocumentText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{upload.name}</div>
                        <div className="text-xs text-slate-500">{(upload.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    </div>
                    <a
                      href={upload.url}
                      className="text-xs font-semibold text-emerald-700 underline underline-offset-4"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View uploaded CV
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUpload(null)}
                    className="mt-2 text-xs font-semibold text-rose-600 underline underline-offset-2"
                  >
                    Replace CV
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <h4 className="text-sm font-semibold text-slate-800">Review your details</h4>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                <li>
                  <span className="font-semibold">Name:</span> {form.fullName}
                </li>
                <li>
                  <span className="font-semibold">Phone:</span> {form.phone} | <span className="font-semibold">City:</span> {form.city}
                </li>
                <li>
                  <span className="font-semibold">Languages:</span> {form.languages.join(", ") || "N/A"}
                </li>
                <li>
                  <span className="font-semibold">Regions:</span> {form.regions.join(", ") || "N/A"}
                </li>
                <li>
                  <span className="font-semibold">Specialties:</span> {form.specialties.join(", ") || "N/A"}
                </li>
                <li>
                  <span className="font-semibold">Experience:</span> {form.years} years
                </li>
                <li className="leading-relaxed">
                  <span className="font-semibold">Summary:</span> {form.experienceText || "N/A"}
                </li>
                <li>
                  <span className="font-semibold">CV:</span> {upload?.name || "Not uploaded"}
                </li>
              </ul>
            </div>
            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.confirm}
                onChange={(e) => setForm((prev) => ({ ...prev, confirm: e.target.checked }))}
                className="mt-1 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                required
              />
              I confirm the information is accurate.
            </label>
            <button
              type="submit"
              disabled={!upload || uploading}
              className="w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              Submit Application
            </button>
          </div>
        )}

        <div className="flex justify-between pt-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Back
            </button>
          ) : (
            <span />
          )}
          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => Math.min(prev + 1, 4))}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Continue
            </button>
          ) : null}
        </div>
      </form>
    );
  };

  if (user && user.role !== "regular") {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 pb-16 pt-24 md:px-6 md:pt-28">
          <div className="rounded-3xl border border-emerald-100 bg-white p-6 text-center shadow-md">
            <p className="text-lg font-bold text-slate-900">You’re already a {user.role}.</p>
            <p className="mt-2 text-sm text-slate-700">Guide applications are only available for regular users.</p>
            <Link
              to="/profile"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Go to Profile
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 pb-16 pt-24 md:px-6 md:pt-28">
          <div className="rounded-3xl border border-emerald-100 bg-white p-6 text-center shadow-md">
            <p className="text-lg font-bold text-slate-900">Please login to apply as a guide.</p>
            <div className="mt-3 flex justify-center gap-3">
              <Link
                to="/login"
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                Register
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-24 md:px-6 md:pt-28">
        <div className="space-y-5">
          <div className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-6 shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Become a Verified Guide</p>
                <h1 className="text-2xl font-bold text-slate-900">Apply to share your expertise</h1>
                <p className="mt-1 text-sm text-slate-700">Admin review required. Approval may take 1–3 days.</p>
                <ul className="mt-3 space-y-1 text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <HiOutlineSparkles className="h-4 w-4 text-emerald-600" />
                    Share your local expertise
                  </li>
                  <li className="flex items-center gap-2">
                    <HiOutlineSparkles className="h-4 w-4 text-emerald-600" />
                    Get featured on tours/events
                  </li>
                  <li className="flex items-center gap-2">
                    <HiOutlineSparkles className="h-4 w-4 text-emerald-600" />
                    Verified by admin review
                  </li>
                </ul>
              </div>
              <div className="hidden h-24 w-24 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 md:flex">
                <HiOutlineCloudUpload className="h-10 w-10" />
              </div>
            </div>
          </div>

          {status === "rejected" && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              Your previous application was rejected. You can update details and re-apply.
            </div>
          )}

          {renderStep()}
        </div>
      </main>
    </div>
  );
};

export default ApplyForGuidePage;
