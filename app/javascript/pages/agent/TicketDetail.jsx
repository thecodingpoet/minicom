import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_TICKET, GET_TICKETS, GET_TICKET_COUNTS } from "../../graphql/queries";
import { UPDATE_TICKET_STATUS, CREATE_COMMENT } from "../../graphql/mutations";
import { StatusPill } from "../../components/StatusDot";
import Avatar from "../../components/Avatar";
import AttachmentStrip from "../../components/AttachmentStrip";
import Spinner from "../../components/Spinner";
import { createTicketSubscription } from "../../utils/actionCable";
import { useAuth } from "../../utils/auth";
import { isAgent } from "../../constants/roles";
import { TICKET_STATUS } from "../../constants/ticket";

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AgentTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [replyBody, setReplyBody] = useState("");
  const scrollRef = useRef(null);
  const { user } = useAuth();

  const { data, loading, error, refetch } = useQuery(GET_TICKET, {
    variables: { id },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!id) return;
    return createTicketSubscription(id, (data) => {
      if (data?.actor_id != null && String(data.actor_id) === String(user?.id)) return;
      refetch();
    });
  }, [id, refetch, user?.id]);

  const [updateStatus] = useMutation(UPDATE_TICKET_STATUS, {
    refetchQueries: [
      { query: GET_TICKET, variables: { id } },
      { query: GET_TICKETS },
      { query: GET_TICKET_COUNTS },
    ],
  });

  const [createComment, { loading: sending }] = useMutation(CREATE_COMMENT, {
    update(cache, { data }) {
      if (!data?.createComment?.comment) return;
      const newCommentRef = cache.identify(data.createComment.comment);
      if (!newCommentRef) return;
      cache.modify({
        id: cache.identify({ __typename: "Ticket", id }),
        fields: {
          comments(existingRefs = []) {
            return [...existingRefs, { __ref: newCommentRef }];
          },
        },
      });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data?.ticket?.comments?.length]);

  useEffect(() => {
    setReplyBody("");
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5">
        <div className="bg-red-50 text-red-500 px-3.5 py-2.5 rounded-lg text-[13px] font-medium">
          {error.message}
        </div>
      </div>
    );
  }

  const ticket = data?.ticket;
  if (!ticket) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Ticket not found
      </div>
    );
  }

  const handleMarkResolved = async () => {
    try {
      const { data } = await updateStatus({
        variables: { ticketId: ticket.id, status: TICKET_STATUS.CLOSED },
      });
      if (data?.updateTicketStatus?.errors?.length > 0) {
        alert(data.updateTicketStatus.errors.join(", "));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    try {
      const { data } = await createComment({
        variables: { ticketId: ticket.id, body: replyBody },
      });
      if (data.createComment.errors.length === 0) {
        setReplyBody("");
      } else {
        alert(data.createComment.errors.join(", "));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="shrink-0 border-b border-gray-200 px-5 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <button
              onClick={() => navigate("/agent")}
              className="md:hidden inline-flex items-center gap-1 text-[13px] font-medium text-gray-500 hover:text-accent mb-2 cursor-pointer border-none bg-transparent p-0"
            >
              ← Back
            </button>
            <h2 className="text-base font-bold leading-snug truncate">{ticket.subject}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Avatar name={ticket.customer.fullName} size="xs" />
              <span className="text-[13px] text-gray-500">{ticket.customer.fullName}</span>
              <span className="text-[13px] text-gray-300">&middot;</span>
              <span className="text-[13px] text-gray-400">{ticket.customer.email}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusPill status={ticket.status} />
            {ticket.status !== TICKET_STATUS.CLOSED && (
              <button
                onClick={handleMarkResolved}
                className="bg-accent hover:bg-accent-hover text-white font-semibold px-3 py-1.5 rounded-lg text-[13px] transition whitespace-nowrap"
              >
                Resolve
              </button>
            )}
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
          <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </p>
          <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 text-[12px] text-gray-400">
            <span>
              Created{" "}
              {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <AttachmentStrip attachments={ticket.attachments} />
        </div>

        <div className="flex flex-col gap-4">
          {ticket.comments.length === 0 && (
            <div className="text-center py-6 text-gray-400 text-[13px]">
              No replies yet. Start the conversation!
            </div>
          )}
          {ticket.comments.map((comment) => {
            const isAgentComment = isAgent(comment.user);
            return (
              <div
                key={comment.id}
                className={`flex gap-2.5 max-w-[80%] ${
                  isAgentComment ? "self-end flex-row-reverse" : "self-start"
                }`}
              >
                <Avatar name={comment.user.fullName} size="sm" />
                <div className={`flex flex-col gap-1 ${isAgentComment ? "items-end" : ""}`}>
                  <span className="text-xs font-semibold text-gray-500 px-1">
                    {comment.user.fullName}
                  </span>
                  <div
                    className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words rounded-[18px] ${
                      isAgentComment
                        ? "rounded-br-md bg-sky-100 text-slate-800 border border-sky-200"
                        : "rounded-bl-md bg-gray-100 text-gray-900 border border-gray-200"
                    }`}
                  >
                    {comment.body}
                  </div>
                  <span className="text-[11px] text-gray-400 px-1">
                    {formatTime(comment.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {ticket.status !== TICKET_STATUS.CLOSED && (
      <div className="shrink-0 border-t border-gray-200 bg-white px-5 py-3">
        <form onSubmit={handleSendReply} className="flex gap-2.5 items-end">
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Type your reply…"
            rows={2}
            required
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none resize-none transition"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                e.target.form.requestSubmit();
              }
            }}
          />
          <button
            type="submit"
            disabled={sending}
            className="bg-accent hover:bg-accent-hover text-white font-semibold px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </form>
      </div>
      )}
    </div>
  );
}
