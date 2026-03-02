import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useNavigate, Link } from "react-router-dom";
import { CREATE_TICKET } from "../../graphql/mutations";

export default function CreateTicket() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [createTicket, { loading }] = useMutation(CREATE_TICKET);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const form = e.target;
    const subject = form.querySelector('[name="subject"]').value;
    const description = form.querySelector('[name="description"]').value;

    try {
      const { data } = await createTicket({
        variables: { subject, description },
      });
      const result = data.createTicket;

      if (result.errors.length > 0) {
        setError(result.errors.join(", "));
        return;
      }

      navigate(`/tickets/${result.ticket.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="create-ticket-page" style={{ maxWidth: 640 }}>
      <Link to="/" className="back-link">← Back to conversations</Link>
      <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 700 }}>New conversation</h2>
      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}
      <div className="ticket-detail-info">
        <form onSubmit={handleSubmit} className="auth-form">
          <sl-input label="Subject" name="subject" placeholder="What do you need help with?" required />
          <sl-textarea label="Description" name="description" placeholder="Describe your issue in detail..." rows={6} required />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <sl-button variant="default" onClick={() => navigate("/")}>Cancel</sl-button>
            <sl-button type="submit" variant="primary" loading={loading || undefined}>
              Send
            </sl-button>
          </div>
        </form>
      </div>
    </div>
  );
}
