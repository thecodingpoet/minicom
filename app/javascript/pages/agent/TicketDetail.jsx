import { useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_TICKET, GET_AGENTS } from "../../graphql/queries";
import { UPDATE_TICKET_STATUS, ASSIGN_TICKET } from "../../graphql/mutations";
import { useAuth } from "../../utils/auth";
import CommentThread from "../../components/CommentThread";

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
  if (error) return <sl-alert variant="danger" open>{error.message}</sl-alert>;

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
      <div className="ticket-detail-header">
        <h2>{ticket.subject}</h2>
        <sl-badge variant={statusVariant[ticket.status]}>
          {statusLabel[ticket.status]}
        </sl-badge>
      </div>

      <sl-card>
        <p>{ticket.description}</p>
        <div className="ticket-meta">
          <span>Customer: {ticket.customer.fullName} ({ticket.customer.email})</span>
          <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
        </div>
      </sl-card>

      {ticket.status !== "closed" && (
        <div className="agent-controls">
          <sl-card>
            <h3>Manage Ticket</h3>
            <div className="controls-row">
              <sl-select
                ref={statusRef}
                label="Status"
                value={ticket.status}
                style={{ maxWidth: "200px" }}
              >
                <sl-option value="open">Open</sl-option>
                <sl-option value="in_progress">In Progress</sl-option>
                <sl-option value="closed">Closed</sl-option>
              </sl-select>

              <sl-select
                ref={assignRef}
                label="Assign to Agent"
                value={ticket.assignedAgent?.id || ""}
                clearable
                style={{ maxWidth: "250px" }}
              >
                {agents.map((agent) => (
                  <sl-option key={agent.id} value={agent.id}>
                    {agent.fullName}
                  </sl-option>
                ))}
              </sl-select>

              <sl-button
                variant="default"
                size="medium"
                onClick={handleAssignToMe}
              >
                Assign to Me
              </sl-button>
            </div>
          </sl-card>
        </div>
      )}

      {ticket.attachments.length > 0 && (
        <div className="attachments-section">
          <h3>Attachments</h3>
          <div className="attachments-list">
            {ticket.attachments.map((att, i) => (
              <sl-card key={i} className="attachment-card">
                <a href={att.url} target="_blank" rel="noreferrer">
                  {att.filename}
                </a>
                <small>{att.contentType}</small>
              </sl-card>
            ))}
          </div>
        </div>
      )}

      <CommentThread
        comments={ticket.comments}
        ticketId={ticket.id}
        canComment={true}
      />
    </div>
  );
}
