import Button from "./Button.jsx";
import Card from "./Card.jsx";

const EmptyState = ({ title = "Nothing here yet", description, actionLabel, onAction, icon }) => (
  <Card className="p-6 text-center text-sm text-slate-700">
    <div className="flex flex-col items-center gap-3">
      {icon ? <div className="text-emerald-600">{icon}</div> : null}
      <p className="text-base font-semibold text-slate-900">{title}</p>
      {description ? <p className="max-w-md text-slate-600">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button variant="secondary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  </Card>
);

export default EmptyState;
