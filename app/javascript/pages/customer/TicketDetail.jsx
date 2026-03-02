import { useParams, Link } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { GET_TICKET } from "../../graphql/queries";
import { useAuth } from "../../utils/auth";
import { StatusPill } from "../../components/StatusDot";
import CommentThread from "../../components/CommentThread";
import AttachmentStrip from "../../components/AttachmentStrip";
import Spinner from "../../components/Spinner";

export default function CustomerTicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data, loading, error } = useQuery(GET_TICKET, {
    variables: { id },
  });

  if (loading) return <Spinner />;
  if (error) return <div className="bg-red-50 text-red-500 px-3.5 py-2.5 rounded-lg text-[13px] font-medium">{error.message}</div>;

  const ticket = data?.ticket;
  if (!ticket) return <p>Ticket not found.</p>;

  const hasAgentComment = ticket.comments.some((c) => c.user.role === "agent");
  const canComment = user?.role === "agent" || hasAgentComment;

  return (
    <div className="flex flex-col gap-5">
      <Link to="/" className="inline-flex items-center gap-1 text-[13px] font-medium text-gray-500 hover:text-accent no-underline">
        ← Back to conversations
      </Link>

      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-bold leading-snug">{ticket.subject}</h2>
        <StatusPill status={ticket.status} />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
        <div className="flex gap-5 mt-4 pt-4 border-t border-gray-100 text-[13px] text-gray-500 flex-wrap">
          <span>Created {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
          {ticket.assignedAgent && (
            <span>Assigned to {ticket.assignedAgent.fullName}</span>
          )}
        </div>
        <AttachmentStrip attachments={ticket.attachments} />
      </div>

      <CommentThread
        comments={ticket.comments}
        ticketId={ticket.id}
        canComment={canComment}
        currentUserRole={user?.role}
      />
    </div>
  );
}
