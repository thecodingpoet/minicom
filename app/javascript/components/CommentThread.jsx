import { useMutation } from "@apollo/client/react";
import { CREATE_COMMENT } from "../graphql/mutations";
import { GET_TICKET } from "../graphql/queries";
import Avatar from "./Avatar";

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CommentThread({ comments, ticketId, canComment, currentUserRole }) {
  const [createComment, { loading }] = useMutation(CREATE_COMMENT, {
    refetchQueries: [{ query: GET_TICKET, variables: { id: ticketId } }],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const textarea = e.target.querySelector('[name="body"]');
    const body = textarea.value;
    if (!body.trim()) return;

    try {
      const { data } = await createComment({
        variables: { ticketId, body },
      });
      if (data.createComment.errors.length === 0) {
        textarea.value = "";
      } else {
        alert(data.createComment.errors.join(", "));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="conversation">
      <div className="conversation-header">
        Conversation ({comments.length})
      </div>

      <div className="conversation-messages">
        {comments.length === 0 && (
          <div className="conversation-empty">
            No messages yet. Start the conversation!
          </div>
        )}

        {comments.map((comment) => {
          const isAgent = comment.user.role === "agent";
          return (
            <div
              key={comment.id}
              className={`message message--${isAgent ? "agent" : "customer"}`}
            >
              <Avatar name={comment.user.fullName} size="sm" />
              <div className="message-content">
                <span className="message-sender">{comment.user.fullName}</span>
                <div className="message-bubble">{comment.body}</div>
                <span className="message-time">{formatTime(comment.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {canComment && (
        <div className="conversation-footer">
          <form onSubmit={handleSubmit}>
            <sl-textarea
              name="body"
              placeholder="Type your reply..."
              rows={2}
              required
            />
            <sl-button type="submit" variant="primary" loading={loading || undefined}>
              Send
            </sl-button>
          </form>
        </div>
      )}

      {!canComment && (
        <div className="conversation-disabled">
          Waiting for an agent to respond before you can reply.
        </div>
      )}
    </div>
  );
}
