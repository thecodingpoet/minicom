import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import { CREATE_TICKET } from "../../graphql/mutations";

export default function CreateTicket() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [createTicket, { loading }] = useMutation(CREATE_TICKET);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
    <div className="create-ticket-page">
      <h2>Create New Ticket</h2>
      {error && (
        <sl-alert variant="danger" open>
          {error}
        </sl-alert>
      )}
      <sl-card>
        <form onSubmit={handleSubmit}>
          <sl-input
            label="Subject"
            value={subject}
            onSlInput={(e) => setSubject(e.target.value)}
            required
          />
          <sl-textarea
            label="Description"
            value={description}
            onSlInput={(e) => setDescription(e.target.value)}
            rows={6}
            required
          />
          <div className="form-actions">
            <sl-button variant="default" onClick={() => navigate("/")}>
              Cancel
            </sl-button>
            <sl-button
              type="submit"
              variant="primary"
              loading={loading || undefined}
            >
              Create Ticket
            </sl-button>
          </div>
        </form>
      </sl-card>
    </div>
  );
}
