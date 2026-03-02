import { useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_TICKET, GET_AGENTS } from "../../graphql/queries";
import { UPDATE_TICKET_STATUS, ASSIGN_TICKET } from "../../graphql/mutations";
import { useAuth } from "../../utils/auth";
import { StatusPill } from "../../components/StatusDot";
import Avatar from "../../components/Avatar";
import CommentThread from "../../components/CommentThread";

export default function AgentTicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const statusRef = useRef(null);
  const assignRef = useRef(null);

  const { data, loading, error } = useQuery(GET_TICKET, {
    variables: { id },
    pollInterval: 10000,
  });

  const { data: agentsData } = useQuery(GET_AGENTS);

  const [updateStatus] = useMutation(UPDATE_TICKET_STATUS, {
    refetchQueries: [{ query: GET_TICKET, variables: { id } }],
  });

  const [assignTicket] = useMutation(ASSIGN_TICKET, {
    refetchQueries: [{ query: GET_TICKET, variables: { id } }],
  });

  useEffect(() => {
    const statusEl = statusRef.current;
    const assignEl = assignRef.current;

    const handleStatusChange = async (e) => {
      try {
        const { data } = await updateStatus({
          variables: { ticketId: id, status: e.target.value },
        });
        if (data.updateTicketStatus.errors.length > 0) {
          alert(data.updateTicketStatus.errors.join(", "));
        }
      } catch (err) {
        alert(err.message);
      }
    };

    const handleAssignChange = async (e) => {
      const agentId = e.target.value || null;
      try {
        const { data } = await assignTicket({
          variables: { ticketId: id, agentId },
        });
        if (data.assignTicket.errors.length > 0) {
          alert(data.assignTicket.errors.join(", "));
        }
      } catch (err) {
        alert(err.message);
      }
    };

    if (statusEl) statusEl.addEventListener("sl-change", handleStatusChange);
    if (assignEl) assignEl.addEventListener("sl-change", handleAssignChange);

    return () => {
      if (statusEl) statusEl.removeEventListener("sl-change", handleStatusChange);
      if (assignEl) assignEl.removeEventListener("sl-change", handleAssignChange);
    };
  });

  if (loading) return <sl-spinner style={{ fontSize: "2rem" }} />;
  if (error) return <div className="auth-error">{error.message}</div>;

  const ticket = data?.ticket;
  if (!ticket) return <p>Ticket not found.</p>;

  const agents = agentsData?.agents || [];

  const handleAssignToMe = async () => {
    try {
      await assignTicket({
        variables: { ticketId: ticket.id, agentId: user.id },
      });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="ticket-detail">
      <Link to="/agent" className="back-link">← Back to inbox</Link>

      <div className="ticket-detail-header">
        <h2>{ticket.subject}</h2>
        <StatusPill status={ticket.status} />
      </div>

      <div className="ticket-detail-columns">
        <div className="ticket-detail-main">
          <div className="ticket-detail-info">
            <p>{ticket.description}</p>
            <div className="ticket-meta">
              <span>Created {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
            </div>
          </div>

          {ticket.attachments.length > 0 && (
            <div className="attachments-section">
              <h3>Attachments</h3>
              <div className="attachments-grid">
                {ticket.attachments.map((att, i) => (
                  <a key={i} href={att.url} target="_blank" rel="noreferrer" className="attachment-chip">
                    📎 {att.filename}
                  </a>
                ))}
              </div>
            </div>
          )}

          <CommentThread
            comments={ticket.comments}
            ticketId={ticket.id}
            canComment={true}
            currentUserRole="agent"
          />
        </div>

        <div className="ticket-sidebar">
          <h3>Details</h3>

          <div className="sidebar-customer">
            <Avatar name={ticket.customer.fullName} size="md" />
            <div className="sidebar-customer-info">
              <strong>{ticket.customer.fullName}</strong>
              <span>{ticket.customer.email}</span>
            </div>
          </div>

          <hr className="sidebar-divider" />

          <div className="sidebar-field">
            <span className="sidebar-field-label">Status</span>
            {ticket.status === "closed" ? (
              <StatusPill status="closed" />
            ) : (
              <sl-select
                ref={statusRef}
                value={ticket.status}
                size="small"
              >
                <sl-option value="open">Open</sl-option>
                <sl-option value="in_progress">In Progress</sl-option>
                <sl-option value="closed">Closed</sl-option>
              </sl-select>
            )}
          </div>

          <div className="sidebar-field">
            <span className="sidebar-field-label">Assigned to</span>
            <sl-select
              ref={assignRef}
              value={ticket.assignedAgent?.id || ""}
              placeholder="Unassigned"
              clearable
              size="small"
            >
              {agents.map((agent) => (
                <sl-option key={agent.id} value={agent.id}>
                  {agent.fullName}
                </sl-option>
              ))}
            </sl-select>
          </div>

          <sl-button
            variant="default"
            size="small"
            style={{ width: "100%" }}
            onClick={handleAssignToMe}
          >
            Assign to me
          </sl-button>
        </div>
      </div>
    </div>
  );
}
