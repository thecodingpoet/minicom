import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import { StatusDot } from "./StatusDot";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function TicketCard({ ticket, showCustomer = false }) {
  const navigate = useNavigate();
  const displayName = showCustomer ? ticket.customer?.fullName : ticket.customer?.fullName;

  return (
    <div
      className="flex items-center gap-3.5 px-5 py-3.5 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors hover:bg-gray-50"
      onClick={() => navigate(`/tickets/${ticket.id}`)}
    >
      <Avatar name={displayName} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <StatusDot status={ticket.status} />
          <span className="font-semibold text-sm text-gray-900 truncate">{ticket.subject}</span>
        </div>
        <div className="text-[13px] text-gray-500 truncate">
          {showCustomer && <strong>{ticket.customer?.fullName} &middot; </strong>}
          {ticket.description?.substring(0, 100)}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(ticket.createdAt)}</span>
        {ticket.assignedAgent && (
          <Avatar name={ticket.assignedAgent.fullName} size="sm" />
        )}
      </div>
    </div>
  );
}
