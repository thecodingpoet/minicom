import { useMutation } from "@apollo/client/react";
import { EXPORT_CLOSED_TICKETS } from "../../graphql/mutations";

export default function Export() {
  const [exportTickets, { loading }] = useMutation(EXPORT_CLOSED_TICKETS);

  const handleExport = async () => {
    try {
      const { data } = await exportTickets();
      const result = data.exportClosedTickets;

      if (result.errors.length > 0) {
        alert(result.errors.join(", "));
        return;
      }

      const blob = new Blob([result.csvData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `closed-tickets-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="export-page">
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Export</h2>
      <div className="export-card">
        <h3>Closed tickets (last 30 days)</h3>
        <p>
          Download a CSV file containing all tickets closed in the last 30 days,
          including ticket ID, subject, customer email, status, and timestamps.
        </p>
        <sl-button
          variant="primary"
          onClick={handleExport}
          loading={loading || undefined}
        >
          Download CSV
        </sl-button>
      </div>
    </div>
  );
}
