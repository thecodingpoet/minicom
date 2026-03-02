import { useState, useRef, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import { GET_TICKETS } from "../../graphql/queries";
import TicketCard from "../../components/TicketCard";

export default function CustomerDashboard() {
  const [statusFilter, setStatusFilter] = useState("");
  const selectRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const el = selectRef.current;
    if (!el) return;
    const handler = (e) => setStatusFilter(e.target.value);
    el.addEventListener("sl-change", handler);
    return () => el.removeEventListener("sl-change", handler);
  }, []);

  const { data, loading, error } = useQuery(GET_TICKETS, {
    variables: { status: statusFilter || undefined },
    pollInterval: 30000,
  });

  if (loading) return <sl-spinner style={{ fontSize: "2rem" }} />;
  if (error) return <div className="auth-error">{error.message}</div>;

  const tickets = data?.tickets || [];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Your conversations</h2>
        <sl-button variant="primary" onClick={() => navigate("/tickets/new")}>
          New conversation
        </sl-button>
      </div>

      <div className="filters">
        <sl-select
          ref={selectRef}
          placeholder="All statuses"
          value={statusFilter}
          clearable
          style={{ minWidth: "180px" }}
        >
          <sl-option value="open">Open</sl-option>
          <sl-option value="in_progress">In Progress</sl-option>
          <sl-option value="closed">Closed</sl-option>
        </sl-select>
      </div>

      {tickets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <p>No conversations yet. Start one!</p>
        </div>
      ) : (
        <div className="ticket-list">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
