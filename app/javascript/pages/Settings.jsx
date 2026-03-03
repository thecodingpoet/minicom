import { useMutation } from "@apollo/client/react";
import { useAuth } from "../utils/auth";
import { isAgent } from "../constants/roles";
import { EXPORT_CLOSED_TICKETS } from "../graphql/mutations";

export default function Settings() {
  const { user } = useAuth();
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
    <div className="max-w-[640px]">
      <h2 className="text-xl font-bold mb-6">Settings</h2>

      {/* Export section — agents only */}
      {isAgent(user) && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-[13px] font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Data Export
          </h3>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">Closed tickets (last 30 days)</h4>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
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
        </div>
      )}
    </div>
  );
}
