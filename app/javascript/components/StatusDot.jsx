const LABELS = {
  open: "Open",
  in_progress: "In Progress",
  closed: "Closed",
};

export function StatusDot({ status }) {
  return <span className={`status-dot status-dot--${status}`} title={LABELS[status]} />;
}

export function StatusPill({ status }) {
  return (
    <span className={`status-pill status-pill--${status}`}>
      <StatusDot status={status} />
      {LABELS[status]}
    </span>
  );
}
