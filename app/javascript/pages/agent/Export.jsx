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
    <div className="max-w-[540px]">
      <h2 className="text-xl font-bold mb-5">Export</h2>
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <h3 className="text-base font-semibold mb-2">Closed tickets (last 30 days)</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-5">
          Download a CSV file containing all tickets closed in the last 30 days,
          including ticket ID, subject, customer email, status, and timestamps.
        </p>
        <button
          onClick={handleExport}
          disabled={loading}
          className="bg-accent hover:bg-accent-hover text-white font-semibold px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
        >
          {loading ? "Exporting..." : "Download CSV"}
        </button>
      </div>
    </div>
  );
}
