const LABELS = {
  open: "Open",
  in_progress: "In Progress",
  closed: "Closed",
};

const DOT_COLORS = {
  open: "bg-green-500",
  in_progress: "bg-amber-500",
  closed: "bg-gray-400",
};

const PILL_STYLES = {
  open: "bg-green-100 text-green-800",
  in_progress: "bg-amber-100 text-amber-800",
  closed: "bg-gray-100 text-gray-500",
};

export function StatusDot({ status }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full shrink-0 ${DOT_COLORS[status]}`}
      title={LABELS[status]}
    />
  );
}

export function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${PILL_STYLES[status]}`}>
      <StatusDot status={status} />
      {LABELS[status]}
    </span>
  );
}
