import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client/react";
import { useAuth } from "../utils/auth";
import { isAgent } from "../constants/roles";
import { EXPORT_CLOSED_TICKETS } from "../graphql/mutations";
import {
  shouldRunSettingsTour,
  runAgentSettingsTour,
  hasCompletedAgentTour,
  clearAgentTourCompleted,
} from "../utils/agentTour";

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAgent(user) && shouldRunSettingsTour()) {
      const timer = setTimeout(runAgentSettingsTour, 200);
      return () => clearTimeout(timer);
    }
  }, [user]);
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

      {isAgent(user) && (
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6" data-tour="csv-export">
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

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Help & Onboarding
            </h3>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Product tour</h4>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  Walk through the inbox, filters, notifications, and CSV export. Perfect for new agents or a quick refresher.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    clearAgentTourCompleted();
                    navigate("/agent");
                  }}
                  className="bg-accent hover:bg-accent-hover text-white font-semibold px-4 py-2 rounded-lg text-sm transition"
                >
                  {hasCompletedAgentTour() ? "Restart tour" : "Start tour"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
