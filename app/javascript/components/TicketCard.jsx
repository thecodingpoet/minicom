import { useNavigate } from "react-router-dom";

const statusVariant = {
  open: "success",
  in_progress: "warning",
  closed: "danger",
};

const statusLabel = {
  open: "Open",
  in_progress: "In Progress",
  closed: "Closed",
};

export default function TicketCard({ ticket, showCustomer = false }) {
  const navigate = useNavigate();

  return (
    <sl-card
      className="ticket-card"
      style={{ cursor: "pointer" }}
      onClick={() => navigate(`/tickets/${ticket.id}`)}
    >
      <div className="ticket-card-header">
        <strong>{ticket.subject}</strong>
        <sl-badge variant={statusVariant[ticket.status] || "neutral"}>
          {statusLabel[ticket.status] || ticket.status}
        </sl-badge>
      </div>
      <p className="ticket-card-description">
        {ticket.description?.substring(0, 120)}
        {ticket.description?.length > 120 ? "..." : ""}
      </p>
      <div className="ticket-card-meta">
        {showCustomer && (
          <span>Customer: {ticket.customer?.fullName}</span>
        )}
        {ticket.assignedAgent && (
          <span>Assigned: {ticket.assignedAgent.fullName}</span>
        )}
        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
      </div>
    </sl-card>
  );
}
