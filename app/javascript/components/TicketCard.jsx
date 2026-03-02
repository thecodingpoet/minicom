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
    <div className="ticket-row" onClick={() => navigate(`/tickets/${ticket.id}`)}>
      <Avatar name={displayName} size="md" />
      <div className="ticket-row-content">
        <div className="ticket-row-top">
          <StatusDot status={ticket.status} />
          <span className="ticket-row-subject">{ticket.subject}</span>
        </div>
        <div className="ticket-row-preview">
          {showCustomer && <strong>{ticket.customer?.fullName} &middot; </strong>}
          {ticket.description?.substring(0, 100)}
        </div>
      </div>
      <div className="ticket-row-meta">
        <span className="ticket-row-time">{timeAgo(ticket.createdAt)}</span>
        {ticket.assignedAgent && (
          <span className="ticket-row-agent">
            <Avatar name={ticket.assignedAgent.fullName} size="sm" />
          </span>
        )}
      </div>
    </div>
  );
}
