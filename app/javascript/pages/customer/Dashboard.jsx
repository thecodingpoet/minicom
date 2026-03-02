import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import { GET_TICKETS } from "../../graphql/queries";
import TicketCard from "../../components/TicketCard";

export default function CustomerDashboard() {
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(GET_TICKETS, {
    variables: { status: statusFilter || undefined },
    pollInterval: 30000,
  });

  if (loading) return <sl-spinner style={{ fontSize: "2rem" }} />;
  if (error) return <sl-alert variant="danger" open>{error.message}</sl-alert>;

  const tickets = data?.tickets || [];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>My Tickets</h2>
        <sl-button variant="primary" onClick={() => navigate("/tickets/new")}>
          <sl-icon slot="prefix" name="plus-lg" />
          New Ticket
        </sl-button>
      </div>

      <div className="filters">
        <sl-select
          label="Filter by status"
          value={statusFilter}
          onSlChange={(e) => setStatusFilter(e.target.value)}
          clearable
          style={{ maxWidth: "200px" }}
        >
          <sl-option value="open">Open</sl-option>
          <sl-option value="in_progress">In Progress</sl-option>
          <sl-option value="closed">Closed</sl-option>
        </sl-select>
      </div>

      <div className="tickets-grid">
        {tickets.length === 0 && (
          <p>No tickets found. Create your first ticket!</p>
        )}
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  );
}
