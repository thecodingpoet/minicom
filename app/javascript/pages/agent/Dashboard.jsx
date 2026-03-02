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
  if (error) return <div className="auth-error">{error.message}</div>;

  const tickets = data?.tickets || [];
  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const closedCount = tickets.filter((t) => t.status === "closed").length;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Inbox</h2>
      </div>

      <div className="stats-row">
        <div className="stat-pill">
          <span className="stat-pill-count">{openCount}</span> Open
        </div>
        <div className="stat-pill">
          <span className="stat-pill-count">{inProgressCount}</span> In Progress
        </div>
        <div className="stat-pill">
          <span className="stat-pill-count">{closedCount}</span> Closed
        </div>
        <div className="stat-pill">
          <span className="stat-pill-count">{tickets.length}</span> Total
        </div>
      </div>

      <div className="filters">
        <sl-select
          ref={statusRef}
          placeholder="All statuses"
          value={statusFilter}
          clearable
          style={{ minWidth: "170px" }}
        >
          <sl-option value="open">Open</sl-option>
          <sl-option value="in_progress">In Progress</sl-option>
          <sl-option value="closed">Closed</sl-option>
        </sl-select>

        <sl-select
          ref={assignRef}
          placeholder="All assignments"
          value={assignmentFilter}
          clearable
          style={{ minWidth: "180px" }}
        >
          <sl-option value="mine">Assigned to Me</sl-option>
          <sl-option value="unassigned">Unassigned</sl-option>
        </sl-select>
      </div>

      {tickets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p>No tickets match your filters.</p>
        </div>
      ) : (
        <div className="ticket-list">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} showCustomer />
          ))}
        </div>
      )}
    </div>
  );
}
