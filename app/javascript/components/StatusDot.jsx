import { TICKET_STATUS } from "../constants/ticket";

const LABELS = {
  [TICKET_STATUS.OPEN]: "Open",
  [TICKET_STATUS.IN_PROGRESS]: "In Progress",
  [TICKET_STATUS.CLOSED]: "Closed",
};

const DOT_COLORS = {
  [TICKET_STATUS.OPEN]: "bg-green-500",
  [TICKET_STATUS.IN_PROGRESS]: "bg-amber-500",
  [TICKET_STATUS.CLOSED]: "bg-gray-400",
};

const PILL_STYLES = {
  [TICKET_STATUS.OPEN]: "bg-green-100 text-green-800",
  [TICKET_STATUS.IN_PROGRESS]: "bg-amber-100 text-amber-800",
  [TICKET_STATUS.CLOSED]: "bg-gray-100 text-gray-500",
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
