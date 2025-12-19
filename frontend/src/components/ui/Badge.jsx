import cn from "../../utils/cn.js";

const tone = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  purple: "bg-purple-50 text-purple-700 ring-purple-100",
};

const Badge = ({ children, color = "slate", className }) => (
  <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1", tone[color], className)}>{children}</span>
);

export default Badge;
