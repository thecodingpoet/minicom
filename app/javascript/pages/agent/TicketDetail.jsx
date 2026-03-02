import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_TICKET, GET_AGENTS } from "../../graphql/queries";
import { UPDATE_TICKET_STATUS, ASSIGN_TICKET } from "../../graphql/mutations";
import { useAuth } from "../../utils/auth";
import { StatusPill } from "../../components/StatusDot";
import Avatar from "../../components/Avatar";
import CommentThread from "../../components/CommentThread";
import Spinner from "../../components/Spinner";

export default function AgentTicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data, loading, error } = useQuery(GET_TICKET, {
    variables: { id },
  });

  const { data: agentsData } = useQuery(GET_AGENTS);

  const [updateStatus] = useMutation(UPDATE_TICKET_STATUS, {
    refetchQueries: [{ query: GET_TICKET, variables: { id } }],
  });

  const [assignTicket] = useMutation(ASSIGN_TICKET, {
    refetchQueries: [{ query: GET_TICKET, variables: { id } }],
  });

  if (loading) return <Spinner />;
  if (error) return <div className="bg-red-50 text-red-500 px-3.5 py-2.5 rounded-lg text-[13px] font-medium">{error.message}</div>;

  const ticket = data?.ticket;
  if (!ticket) return <p>Ticket not found.</p>;

  const agents = agentsData?.agents || [];

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
    <div className="flex flex-col gap-5">
      <Link to="/agent" className="inline-flex items-center gap-1 text-[13px] font-medium text-gray-500 hover:text-accent no-underline">
        ← Back to inbox
      </Link>

      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-bold leading-snug">{ticket.subject}</h2>
        <StatusPill status={ticket.status} />
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-5 items-start max-md:grid-cols-1">
        {/* Main content */}
        <div className="flex flex-col gap-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            <div className="flex gap-5 mt-4 pt-4 border-t border-gray-100 text-[13px] text-gray-500">
              <span>Created {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
            </div>
          </div>

          {ticket.attachments.length > 0 && (
            <div className="mt-1">
              <h3 className="text-sm font-semibold mb-2.5">Attachments</h3>
              <div className="flex gap-2 flex-wrap">
                {ticket.attachments.map((att, i) => (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3.5 py-2 text-[13px] text-accent hover:bg-accent-light transition no-underline"
                  >
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

        {/* Sidebar */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4 sticky top-[76px] max-md:static">
          <h3 className="text-[13px] font-semibold uppercase tracking-wider text-gray-400 -mb-1">
            Details
          </h3>

          <div className="flex items-center gap-2.5 py-2.5">
            <Avatar name={ticket.customer.fullName} size="md" />
            <div className="text-[13px]">
              <strong className="block font-semibold">{ticket.customer.fullName}</strong>
              <span className="text-gray-500 text-xs">{ticket.customer.email}</span>
            </div>
          </div>

          <hr className="border-t border-gray-100 m-0" />

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-500">Status</span>
            {ticket.status === "closed" ? (
              <StatusPill status="closed" />
            ) : (
              <select
                value={ticket.status}
                onChange={handleStatusChange}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-500">Assigned to</span>
            <select
              value={ticket.assignedAgent?.id || ""}
              onChange={handleAssignChange}
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition"
            >
              <option value="">Unassigned</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.fullName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAssignToMe}
            className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium px-3 py-1.5 rounded-lg text-sm transition"
          >
            Assign to me
          </button>
        </div>
      </div>
    </div>
  );
}
