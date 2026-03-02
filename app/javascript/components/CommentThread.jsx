import { useMutation } from "@apollo/client/react";
import { CREATE_COMMENT } from "../graphql/mutations";
import { GET_TICKET } from "../graphql/queries";

export default function CommentThread({ comments, ticketId, canComment }) {
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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="comment-thread">
      <h3>Comments</h3>

      {comments.length === 0 && (
        <p className="no-comments">No comments yet.</p>
      )}

      <div className="comments-list">
        {comments.map((comment) => (
          <sl-card key={comment.id} className="comment-card">
            <div className="comment-header">
              <strong>{comment.user.fullName}</strong>
              <sl-badge
                variant={comment.user.role === "agent" ? "primary" : "neutral"}
              >
                {comment.user.role}
              </sl-badge>
              <span className="comment-date">{formatDate(comment.createdAt)}</span>
            </div>
            <p className="comment-body">{comment.body}</p>
          </sl-card>
        ))}
      </div>

      {canComment && (
        <form onSubmit={handleSubmit} className="comment-form">
          <sl-textarea label="Add a comment" name="body" rows={3} required />
          <sl-button type="submit" variant="primary" loading={loading || undefined}>
            Post Comment
          </sl-button>
        </form>
      )}

      {!canComment && (
        <sl-alert variant="neutral" open>
          <sl-icon slot="icon" name="info-circle" />
          Waiting for an agent to respond before you can comment.
        </sl-alert>
      )}
    </div>
  );
}
