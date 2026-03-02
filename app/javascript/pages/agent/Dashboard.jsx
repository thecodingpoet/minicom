import { useState, useRef, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_TICKETS } from "../../graphql/queries";
import TicketCard from "../../components/TicketCard";

export default function AgentDashboard() {
  const [statusFilter, setStatusFilter] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("");
  const statusRef = useRef(null);
  const assignRef = useRef(null);

  useEffect(() => {
    const statusEl = statusRef.current;
    const assignEl = assignRef.current;

    const onStatusChange = (e) => setStatusFilter(e.target.value);
    const onAssignChange = (e) => setAssignmentFilter(e.target.value);

    if (statusEl) statusEl.addEventListener("sl-change", onStatusChange);
    if (assignEl) assignEl.addEventListener("sl-change", onAssignChange);

    return () => {
      if (statusEl) statusEl.removeEventListener("sl-change", onStatusChange);
      if (assignEl) assignEl.removeEventListener("sl-change", onAssignChange);
    };
  }, []);

  const { data, loading, error } = useQuery(GET_TICKETS, {
    variables: {
      status: statusFilter || undefined,
      assignment: assignmentFilter || undefined,
    },
    pollInterval: 15000,
  });

  if (loading) return <sl-spinner style={{ fontSize: "2rem" }} />;
  if (error) return <sl-alert variant="danger" open>{error.message}</sl-alert>;

  const tickets = data?.tickets || [];

  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const closedCount = tickets.filter((t) => t.status === "closed").length;

  return (
    <div className="dashboard">
      <h2>Agent Dashboard</h2>

      <div className="stats-cards">
        <sl-card className="stat-card">
          <div className="stat-number">{openCount}</div>
          <div className="stat-label">Open</div>
        </sl-card>
        <sl-card className="stat-card">
          <div className="stat-number">{inProgressCount}</div>
          <div className="stat-label">In Progress</div>
        </sl-card>
        <sl-card className="stat-card">
          <div className="stat-number">{closedCount}</div>
          <div className="stat-label">Closed</div>
        </sl-card>
        <sl-card className="stat-card">
          <div className="stat-number">{tickets.length}</div>
          <div className="stat-label">Total</div>
        </sl-card>
      </div>

      <div className="filters">
        <sl-select
          ref={statusRef}
          label="Status"
          value={statusFilter}
          clearable
          style={{ maxWidth: "180px" }}
        >
          <sl-option value="open">Open</sl-option>
          <sl-option value="in_progress">In Progress</sl-option>
          <sl-option value="closed">Closed</sl-option>
        </sl-select>

        <sl-select
          ref={assignRef}
          label="Assignment"
          value={assignmentFilter}
          clearable
          style={{ maxWidth: "180px" }}
        >
          <sl-option value="mine">Assigned to Me</sl-option>
          <sl-option value="unassigned">Unassigned</sl-option>
        </sl-select>
      </div>

      <div className="tickets-grid">
        {tickets.length === 0 && <p>No tickets match your filters.</p>}
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} showCustomer />
        ))}
      </div>
    </div>
  );
}
