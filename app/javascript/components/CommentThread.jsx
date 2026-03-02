import { useState } from "react";
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
  const [body, setBody] = useState("");

  const [createComment, { loading }] = useMutation(CREATE_COMMENT, {
    refetchQueries: [{ query: GET_TICKET, variables: { id: ticketId } }],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;

    try {
      const { data } = await createComment({
        variables: { ticketId, body },
      });
      if (data.createComment.errors.length === 0) {
        setBody("");
      } else {
        alert(data.createComment.errors.join(", "));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 text-sm font-semibold text-gray-900">
        Conversation ({comments.length})
      </div>

      <div className="px-5 py-6 flex flex-col gap-5 min-h-[120px]">
        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-[13px]">
            No messages yet. Start the conversation!
          </div>
        )}

        {comments.map((comment) => {
          const isAgent = comment.user.role === "agent";
          return (
            <div
              key={comment.id}
              className={`flex gap-2.5 max-w-[80%] ${
                isAgent ? "self-end flex-row-reverse" : "self-start"
              }`}
            >
              <Avatar name={comment.user.fullName} size="sm" />
              <div className={`flex flex-col gap-1 ${isAgent ? "items-end" : ""}`}>
                <span className="text-xs font-semibold text-gray-500 px-1">
                  {comment.user.fullName}
                </span>
                <div
                  className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    isAgent
                      ? "bg-accent text-white rounded-[18px] rounded-br-md"
                      : "bg-gray-100 text-gray-900 rounded-[18px] rounded-bl-md"
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

      {canComment && (
        <div className="border-t border-gray-100 px-5 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2.5 items-end">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your reply..."
              rows={2}
              required
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none resize-none transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-accent hover:bg-accent-hover text-white font-semibold px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      )}

      {!canComment && (
        <div className="border-t border-gray-100 px-5 py-3.5 text-center text-[13px] text-gray-400 bg-gray-50">
          Waiting for an agent to respond before you can reply.
        </div>
      )}
    </div>
  );
}
