const StatCard = ({ icon: Icon, label, value, colorClass = "text-emerald-600", bgClass = "bg-emerald-50" }) => (
  <div className={`flex items-center gap-3 rounded-2xl ${bgClass} px-3 py-2 text-left shadow-md ring-1 ring-emerald-100`}>
    {Icon ? <Icon className={`h-5 w-5 ${colorClass}`} /> : null}
    <div>
      <div className="text-base font-bold text-emerald-700">{value}</div>
      <div className="text-xs font-semibold text-emerald-800/80">{label}</div>
    </div>
  </div>
);

export default StatCard;
