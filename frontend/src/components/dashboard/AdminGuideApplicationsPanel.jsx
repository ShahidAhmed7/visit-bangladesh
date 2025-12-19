import { useEffect, useMemo, useState } from "react";
import {
  HiOutlineDocumentText,
  HiOutlineExternalLink,
  HiOutlineSearch,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineEye,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import toast from "react-hot-toast";
import { guideApplicationsAPI } from "../../services/api/guideApplications.api.js";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_GUIDE === "true";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const mockApplications = [
  {
    id: "ga-1",
    userId: "u-1",
    name: "Guide Applicant One",
    email: "applicant1@example.com",
    phone: "+880171111111",
    city: "Dhaka",
    experienceText: "I have guided over 50 heritage walks across Old Dhaka. I specialize in architecture and food trails.",
    languages: ["Bangla", "English", "Hindi"],
    regions: ["Dhaka", "Chattogram"],
    cvUrl: "https://example.com/cv1.pdf",
    status: "pending",
    createdAt: "2025-01-05T10:00:00Z",
    bytes: 245760,
    format: "pdf",
    originalFilename: "cv-dhaka-guide.pdf",
  },
  {
    id: "ga-2",
    userId: "u-2",
    name: "Heritage Expert",
    email: "heritage@example.com",
    phone: "+880177777777",
    city: "Sylhet",
    experienceText: "Focused on tea trails and rain forest hikes with small groups for 3+ years.",
    languages: ["Bangla", "English"],
    regions: ["Sylhet"],
    cvUrl: "https://example.com/cv2.pdf",
    status: "approved",
    createdAt: "2024-12-18T09:00:00Z",
    reviewedAt: "2024-12-20T09:00:00Z",
    bytes: 180000,
    format: "pdf",
    originalFilename: "sylhet-guide.pdf",
  },
  {
    id: "ga-3",
    userId: "u-3",
    name: "Nature Trekker",
    email: "trekker@example.com",
    phone: "+880199999999",
    city: "Bandarban",
    experienceText: "Guided families on hill treks; licensed for eco trails. Looking to expand to Cox's Bazar.",
    languages: ["Bangla", "English", "Chakma"],
    regions: ["Chattogram"],
    cvUrl: "https://example.com/cv3.pdf",
    status: "rejected",
    createdAt: "2024-12-10T09:00:00Z",
    reviewedAt: "2024-12-12T09:00:00Z",
    bytes: 200000,
    format: "pdf",
    originalFilename: "trekker-cv.pdf",
    adminNotes: "Please include references.",
  },
];

const statusStyles = {
  pending: "bg-amber-100 text-amber-800 ring-amber-200",
  approved: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  rejected: "bg-rose-100 text-rose-800 ring-rose-200",
};

const formatDate = (value) => new Date(value).toLocaleDateString();

const bytesToSize = (bytes) => {
  if (!bytes) return null;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const StatusChip = ({ status }) => (
  <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1", statusStyles[status])}>
    {status === "approved" && <HiOutlineCheck className="mr-1 h-4 w-4" />}
    {status === "pending" && <HiOutlineDocumentText className="mr-1 h-4 w-4" />}
    {status === "rejected" && <HiOutlineX className="mr-1 h-4 w-4" />}
    {status?.[0]?.toUpperCase() + status?.slice(1)}
  </span>
);

const SkeletonRow = () => (
  <div className="flex animate-pulse items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-slate-200" />
      <div>
        <div className="h-3 w-32 rounded bg-slate-200" />
        <div className="mt-2 h-2.5 w-24 rounded bg-slate-200" />
      </div>
    </div>
    <div className="h-3 w-20 rounded bg-slate-200" />
    <div className="h-8 w-24 rounded bg-slate-200" />
  </div>
);

const StatPill = ({ label, value, color }) => (
  <div className={cn("flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm ring-1", color)}>
    <span className="text-slate-600">{label}</span>
    <span className="text-lg text-slate-900">{value}</span>
  </div>
);

const AdminGuideApplicationsPanel = () => {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    let timer;
    if (USE_MOCK) {
      timer = setTimeout(() => {
        setApplications(mockApplications);
        setCounts({
          pending: mockApplications.filter((a) => a.status === "pending").length,
          approved: mockApplications.filter((a) => a.status === "approved").length,
          rejected: mockApplications.filter((a) => a.status === "rejected").length,
          total: mockApplications.length,
        });
        setTotal(mockApplications.length);
        setLoading(false);
      }, 300);
    }
    return () => clearTimeout(timer);
  }, []);

  const fetchCounts = async () => {
    if (USE_MOCK) return;
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        guideApplicationsAPI.adminList({ status: "pending", page: 1, limit: 1 }),
        guideApplicationsAPI.adminList({ status: "approved", page: 1, limit: 1 }),
        guideApplicationsAPI.adminList({ status: "rejected", page: 1, limit: 1 }),
      ]);
      const pendingTotal = pendingRes.data?.pagination?.total ?? pendingRes.data?.data?.pagination?.total ?? 0;
      const approvedTotal = approvedRes.data?.pagination?.total ?? approvedRes.data?.data?.pagination?.total ?? 0;
      const rejectedTotal = rejectedRes.data?.pagination?.total ?? rejectedRes.data?.data?.pagination?.total ?? 0;
      setCounts({
        pending: pendingTotal,
        approved: approvedTotal,
        rejected: rejectedTotal,
        total: pendingTotal + approvedTotal + rejectedTotal,
      });
    } catch (err) {
      toast.error("Failed to load counts");
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const getId = (app) => app?.id || app?._id;

  const fetchList = async (opts = {}) => {
    if (USE_MOCK) return;
    const nextStatus = opts.status ?? statusFilter;
    const nextPage = opts.page ?? page;
    try {
      setLoading(true);
      const res = await guideApplicationsAPI.adminList({
        status: nextStatus === "all" ? undefined : nextStatus,
        page: nextPage,
        limit,
        from: dateRange.from || undefined,
        to: dateRange.to || undefined,
      });
      const apps = res.data?.data || res.data?.applications || [];
      const pagination = res.data?.pagination || res.data?.data?.pagination || {};
      setApplications(apps);
      setTotal(pagination.total || apps.length);
      setPage(nextPage);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList({ status: statusFilter, page: 1 });
  }, [statusFilter, dateRange.from, dateRange.to]);

  useEffect(() => {
    if (!USE_MOCK) fetchList({ page });
  }, [page]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return applications
      .filter((app) => (statusFilter === "all" ? true : app.status === statusFilter))
      .filter((app) => {
        const name = app.name || app.userId?.name || "";
        const email = app.email || app.userId?.email || "";
        return name.toLowerCase().includes(term) || email.toLowerCase().includes(term);
      });
  }, [applications, search, statusFilter]);

  const buildCvHref = (cv = {}, fallbackUrl) => {
    const baseUrl = cv.url || fallbackUrl;
    if (!baseUrl) return null;
    const isCloudinary = baseUrl.includes("res.cloudinary.com") && baseUrl.includes("/upload/");
    if (!isCloudinary || baseUrl.includes("fl_attachment:")) return baseUrl;

    const uploadSegment = baseUrl.includes("/raw/upload/") ? "/raw/upload/" : "/upload/";
    const ext = (cv.format || "").split("/").pop() || "pdf";
    const rawName =
      cv.originalFilename ||
      (() => {
        try {
          return decodeURIComponent(new URL(baseUrl).pathname.split("/").pop() || "");
        } catch {
          return "";
        }
      })() ||
      cv.publicId ||
      "cv";

    const baseName = rawName.replace(/\.[^/.]+$/, "");
    const safeBase = baseName.replace(/[^a-z0-9_-]/gi, "_") || "cv";
    const safeExt = (ext || "").replace(/[^a-z0-9]/gi, "") || "pdf";

    const withAttachmentFlag = baseUrl.replace(uploadSegment, `${uploadSegment}fl_attachment:${safeBase}/`);
    try {
      const url = new URL(withAttachmentFlag);
      const filename = `${safeBase}.${safeExt}`;
      url.searchParams.set("response-content-disposition", `attachment; filename=\"${filename}\"`);
      return url.toString();
    } catch {
      return withAttachmentFlag;
    }
  };

  const updateStatus = (id, nextStatus, notes) => {
    setApplications((prev) =>
      prev.map((app) =>
        getId(app) === id
          ? {
              ...app,
              status: nextStatus,
              reviewedAt: new Date().toISOString(),
              adminNotes: notes ?? app.adminNotes,
            }
          : app
      )
    );
    if (getId(selected) === id) {
      setSelected((prev) => ({ ...prev, status: nextStatus, reviewedAt: new Date().toISOString(), adminNotes: notes ?? prev.adminNotes }));
    }
    setCounts((prev) => {
      const delta = { ...prev };
      if (nextStatus === "approved") {
        delta.pending = Math.max(0, delta.pending - 1);
        delta.approved += 1;
      }
      if (nextStatus === "rejected") {
        delta.pending = Math.max(0, delta.pending - 1);
        delta.rejected += 1;
      }
      return { ...delta, total: prev.total };
    });
  };

  const handleApprove = async (app, notes) => {
    if (app.status !== "pending") return;
    const appId = getId(app);
    if (USE_MOCK) {
      updateStatus(appId, "approved", notes);
      return;
    }
    try {
      await toast.promise(guideApplicationsAPI.approve(appId, { adminNotes: notes }), {
        loading: "Approving...",
        success: "Application approved",
        error: (err) => err.response?.data?.message || "Failed to approve",
      });
      updateStatus(appId, "approved", notes);
      fetchList({ page: 1 });
      fetchCounts();
    } catch {
      // toast.promise already handled error
    }
  };
  const handleReject = async (app, notes) => {
    if (app.status !== "pending") return;
    const appId = getId(app);
    if (USE_MOCK) {
      updateStatus(appId, "rejected", notes);
      return;
    }
    try {
      await toast.promise(guideApplicationsAPI.reject(appId, { adminNotes: notes }), {
        loading: "Rejecting...",
        success: "Application rejected",
        error: (err) => err.response?.data?.message || "Failed to reject",
      });
      updateStatus(appId, "rejected", notes);
      fetchList({ page: 1 });
      fetchCounts();
    } catch {
      // handled
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const bulkAct = async (action) => {
    if (!selectedIds.size) {
      toast.error("Select at least one application");
      return;
    }
    if (USE_MOCK) {
      selectedIds.forEach((id) => updateStatus(id, action));
      setSelectedIds(new Set());
      return;
    }
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(
        ids.map((id) =>
          action === "approved"
            ? guideApplicationsAPI.approve(id, {})
            : guideApplicationsAPI.reject(id, {})
        )
      );
      ids.forEach((id) => updateStatus(id, action));
      setSelectedIds(new Set());
      fetchList({ page: 1 });
      fetchCounts();
      toast.success(`Bulk ${action === "approved" ? "approve" : "reject"} complete`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Bulk action failed");
    }
  };

  const statusOptions = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-md">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Guide Applications</h2>
            <p className="text-sm text-slate-600">Review and approve guide role requests</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {statusOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setStatusFilter(opt.key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition",
                  statusFilter === opt.key
                    ? "bg-emerald-600 text-white ring-emerald-600"
                    : "bg-emerald-50 text-emerald-700 ring-emerald-100 hover:bg-emerald-100"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="grid grid-cols-2 gap-3 md:col-span-2 md:grid-cols-4">
            <StatPill label="Pending" value={counts.pending} color="bg-amber-50 ring-amber-100" />
            <StatPill label="Approved" value={counts.approved} color="bg-emerald-50 ring-emerald-100" />
            <StatPill label="Rejected" value={counts.rejected} color="bg-rose-50 ring-rose-100" />
            <StatPill label="Total" value={counts.total} color="bg-slate-50 ring-slate-100" />
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
            <div className="relative w-full md:w-64">
              <HiOutlineSearch className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email"
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:bg-white"
              />
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => bulkAct("approved")}
          className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          Bulk Approve
        </button>
        <button
          onClick={() => bulkAct("rejected")}
          className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100"
        >
          Bulk Reject
        </button>
        {selectedIds.size ? <span className="text-xs font-semibold text-slate-600">{selectedIds.size} selected</span> : null}
      </div>

      <div className="space-y-3">
        {loading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50 px-6 py-10 text-center text-sm text-emerald-700 shadow-inner">
            {statusFilter === "pending" ? "No pending applications" : "No applications for this filter"}
            {statusFilter === "pending" && (
              <button
                onClick={() => setStatusFilter("all")}
                className="ml-3 rounded-full bg-white px-3 py-1 font-semibold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100"
              >
                Show all
              </button>
            )}
          </div>
        ) : (
          filtered.map((app) => {
            const displayName = app.name || app.userId?.name || "Applicant";
            const displayEmail = app.email || app.userId?.email || "No email";
            const appId = getId(app);
            return (
              <div key={appId} className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(appId)}
                    onChange={() => toggleSelect(appId)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  {(displayName || "A")?.[0]}
                  </div>
                  <div>
                  <div className="text-sm font-semibold text-slate-900">{displayName}</div>
                  <div className="text-xs text-slate-600">{displayEmail}</div>
                  <div className="text-xs text-slate-500">Applied {formatDate(app.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusChip status={app.status} />
                  <button
                    onClick={async () => {
                      if (USE_MOCK) {
                        setSelected(app);
                        return;
                      }
                      try {
                        const res = await guideApplicationsAPI.adminGet(appId);
                        setSelected(res.data?.data || res.data);
                      } catch {
                        toast.error("Failed to load application");
                      }
                    }}
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-50"
                  >
                    <span className="flex items-center gap-1">
                      <HiOutlineEye className="h-4 w-4" />
                      View
                    </span>
                  </button>
                  <button
                    onClick={() => handleApprove(app)}
                    disabled={app.status !== "pending"}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition",
                      app.status === "pending"
                        ? "bg-emerald-600 text-white ring-emerald-600 hover:bg-emerald-700"
                        : "cursor-not-allowed bg-slate-100 text-slate-400 ring-slate-200"
                    )}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(app)}
                    disabled={app.status !== "pending"}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition",
                      app.status === "pending"
                        ? "bg-rose-50 text-rose-700 ring-rose-200 hover:bg-rose-100"
                        : "cursor-not-allowed bg-slate-100 text-slate-400 ring-slate-200"
                    )}
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!loading && total > limit ? (
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700">
          <span>
            Page {page} of {Math.max(1, Math.ceil(total / limit))}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      {selected ? (
        <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg overflow-y-auto border-l border-emerald-100 bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Application Detail</h3>
              <p className="text-sm text-slate-600">Review the applicant info and CV</p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            >
              Close
            </button>
          </div>
          <div className="mt-4 space-y-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
                {(selected.name || selected.userId?.name || "A")?.[0]}
              </div>
              <div>
                <div className="text-base font-semibold text-slate-900">{selected.name || selected.userId?.name}</div>
                <div className="text-sm text-slate-700">{selected.email || selected.userId?.email}</div>
                <div className="text-xs text-slate-500">
                  {selected.phone || selected.userId?.phone || "N/A"} • {selected.city || selected.userId?.location?.city || "N/A"}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusChip status={selected.status} />
              <span className="text-xs text-slate-500">Applied {formatDate(selected.createdAt)}</span>
              {selected.reviewedAt && <span className="text-xs text-slate-500">Reviewed {formatDate(selected.reviewedAt)}</span>}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Experience</h4>
              <p className="mt-1 rounded-xl bg-white p-3 text-sm text-slate-700 ring-1 ring-slate-100">{selected.experienceText}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selected.languages?.map((lang) => (
                <span key={lang} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  {lang}
                </span>
              ))}
              {selected.regions?.map((region) => (
                <span key={region} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  {region}
                </span>
              ))}
            </div>
            <div className="rounded-2xl bg-white p-4 ring-1 ring-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">CV</p>
                  <p className="text-xs text-slate-600">
                    {selected.originalFilename || selected.cv?.originalFilename || "Uploaded CV"}{" "}
                    {bytesToSize(selected.bytes || selected.cv?.bytes) ? `• ${bytesToSize(selected.bytes || selected.cv?.bytes)}` : ""}{" "}
                    {selected.format || selected.cv?.format ? `• ${(selected.format || selected.cv?.format || "").toUpperCase()}` : ""}
                  </p>
                </div>
                {(() => {
                  const cv = selected.cv || {};
                  const href = buildCvHref(cv, selected.cvUrl);
                  if (!href) return null;
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                    >
                      <HiOutlineExternalLink className="h-4 w-4" />
                      Open CV
                    </a>
                  );
                })()}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Decision notes (optional)</p>
              <textarea
                rows={3}
                defaultValue={selected.adminNotes}
                onChange={(e) => setSelected((prev) => ({ ...prev, adminNotes: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400"
                placeholder="Add a short note for the applicant"
              />
              <div className="flex gap-2">
                <button
                  disabled={selected.status !== "pending"}
                  onClick={() => handleApprove(selected, selected.adminNotes)}
                  className={cn(
                    "inline-flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ring-1 transition",
                    selected.status === "pending"
                      ? "bg-emerald-600 text-white ring-emerald-600 hover:bg-emerald-700"
                      : "cursor-not-allowed bg-slate-100 text-slate-400 ring-slate-200"
                  )}
                >
                  <HiOutlineCheckCircle className="h-5 w-5" />
                  Approve
                </button>
                <button
                  disabled={selected.status !== "pending"}
                  onClick={() => handleReject(selected, selected.adminNotes)}
                  className={cn(
                    "inline-flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ring-1 transition",
                    selected.status === "pending"
                      ? "bg-white text-rose-700 ring-rose-200 hover:bg-rose-50"
                      : "cursor-not-allowed bg-slate-100 text-slate-400 ring-slate-200"
                  )}
                >
                  <HiOutlineX className="h-5 w-5" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminGuideApplicationsPanel;
