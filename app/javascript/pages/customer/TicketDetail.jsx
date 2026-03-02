import { useParams, Link } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { GET_TICKET } from "../../graphql/queries";
import { useAuth } from "../../utils/auth";
import { StatusPill } from "../../components/StatusDot";
import CommentThread from "../../components/CommentThread";

export default function CustomerTicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data, loading, error } = useQuery(GET_TICKET, {
    variables: { id },
    pollInterval: 15000,
  });

  if (loading) return <sl-spinner style={{ fontSize: "2rem" }} />;
  if (error) return <div className="auth-error">{error.message}</div>;

  const ticket = data?.ticket;
  if (!ticket) return <p>Ticket not found.</p>;

  const hasAgentComment = ticket.comments.some((c) => c.user.role === "agent");
  const canComment = user?.role === "agent" || hasAgentComment;

  return (
    <div className="ticket-detail">
      <Link to="/" className="back-link">← Back to conversations</Link>

      <div className="ticket-detail-header">
        <h2>{ticket.subject}</h2>
        <StatusPill status={ticket.status} />
      </div>

      <div className="ticket-detail-info">
        <p>{ticket.description}</p>
        <div className="ticket-meta">
          <span>Created {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
          {ticket.assignedAgent && (
            <span>Assigned to {ticket.assignedAgent.fullName}</span>
          )}
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
        canComment={canComment}
        currentUserRole={user?.role}
      />
    </div>
  );
}
