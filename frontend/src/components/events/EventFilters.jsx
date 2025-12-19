import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";
import cn from "../../utils/cn.js";

const typeFilters = [
  { value: "", label: "All" },
  { value: "tour", label: "Tours" },
  { value: "festival", label: "Festivals" },
];

const EventFilters = ({ filters, onChange }) => {
  const setValue = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {typeFilters.map((f) => (
          <Button
            key={f.value || "all"}
            variant={filters.type === f.value ? "primary" : "secondary"}
            size="sm"
            className={cn("shadow-sm", filters.type === f.value ? "" : "bg-white/80 text-emerald-700")}
            onClick={() => setValue("type", f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>
      <div className="grid max-w-4xl gap-3 md:grid-cols-2">
        <Input
          type="text"
          placeholder="Filter by division..."
          value={filters.division}
          onChange={(e) => setValue("division", e.target.value)}
          className="border-white/30 bg-white/10 text-white placeholder:text-white/80 focus:border-white focus:ring-white/70"
        />
        <Input
          type="text"
          placeholder="Filter by district..."
          value={filters.district}
          onChange={(e) => setValue("district", e.target.value)}
          className="border-white/30 bg-white/10 text-white placeholder:text-white/80 focus:border-white focus:ring-white/70"
        />
      </div>
    </div>
  );
};

export default EventFilters;
