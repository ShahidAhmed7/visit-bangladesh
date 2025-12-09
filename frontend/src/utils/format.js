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
