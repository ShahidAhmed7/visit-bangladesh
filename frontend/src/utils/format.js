export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const excerpt = (text = "", max = 140) => {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
};

export const normalizeId = (val) => {
  if (!val) return "";
  return typeof val === "object" && val._id ? String(val._id) : String(val);
};

export const getEventStatus = (startDate, endDate) => {
  if (!startDate) return "upcoming";
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return "upcoming";
  const now = new Date();
  const end = endDate ? new Date(endDate) : null;

  if (end && !Number.isNaN(end.getTime())) {
    if (now < start) return "upcoming";
    if (now > end) return "done";
    return "ongoing";
  }

  if (now < start) return "upcoming";
  return start.toDateString() === now.toDateString() ? "ongoing" : "done";
};
