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

    const formData = new FormData(e.target);
    const subject = formData.get("subject");
    const description = formData.get("description");

    if (!subject || !description) return;

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
    <div className="max-w-[640px]">
      <Link to="/" className="inline-flex items-center gap-1 text-[13px] font-medium text-gray-500 hover:text-accent mb-4 no-underline">
        ← Back to conversations
      </Link>
      <h2 className="text-xl font-bold mb-5">New conversation</h2>

      {error && (
        <div className="bg-red-50 text-red-500 px-3.5 py-2.5 rounded-lg text-[13px] font-medium mb-4">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
            <input
              type="text"
              name="subject"
              placeholder="What do you need help with?"
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              name="description"
              placeholder="Describe your issue in detail..."
              rows={6}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none resize-none transition"
            />
          </div>
          <div className="flex gap-2.5 justify-end mt-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-accent hover:bg-accent-hover text-white font-semibold px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
