const SidebarNav = ({ items = [], active, onChange }) => (
  <nav className="space-y-2">
    {items.map((item) => (
      <button
        key={item.key}
        onClick={() => onChange(item.key)}
        className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm font-semibold transition ${
          active === item.key ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 shadow-sm" : "hover:bg-slate-50 text-slate-700"
        }`}
      >
        {item.icon ? <item.icon className={`h-5 w-5 ${item.colorClass || "text-emerald-600"}`} /> : null}
        <span>{item.label}</span>
      </button>
    ))}
  </nav>
);

export default SidebarNav;
