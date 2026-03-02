import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { GET_TICKET } from "../../graphql/queries";
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

export default function CustomerTicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data, loading, error } = useQuery(GET_TICKET, {
    variables: { id },
    pollInterval: 15000,
  });

  if (loading) return <sl-spinner style={{ fontSize: "2rem" }} />;
  if (error) return <sl-alert variant="danger" open>{error.message}</sl-alert>;

  const ticket = data?.ticket;
  if (!ticket) return <p>Ticket not found.</p>;

  const hasAgentComment = ticket.comments.some((c) => c.user.role === "agent");
  const canComment = user?.role === "agent" || hasAgentComment;

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
          <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
          {ticket.assignedAgent && (
            <span>Assigned to: {ticket.assignedAgent.fullName}</span>
          )}
        </div>
      </sl-card>

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
        canComment={canComment}
      />
    </div>
  );
}
