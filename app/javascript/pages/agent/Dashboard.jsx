import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_TICKETS } from "../../graphql/queries";
import TicketCard from "../../components/TicketCard";
import Spinner from "../../components/Spinner";

export default function AgentDashboard() {
  const [statusFilter, setStatusFilter] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("");

  const { data, loading, error } = useQuery(GET_TICKETS, {
    variables: {
      status: statusFilter || undefined,
      assignment: assignmentFilter || undefined,
    },
    pollInterval: 15000,
  });

  if (loading) return <Spinner />;
  if (error) return <div className="bg-red-50 text-red-500 px-3.5 py-2.5 rounded-lg text-[13px] font-medium">{error.message}</div>;

  const tickets = data?.tickets || [];
  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const closedCount = tickets.filter((t) => t.status === "closed").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Inbox</h2>
      </div>

      <div className="flex gap-3 flex-wrap">
        {[
          { label: "Open", count: openCount },
          { label: "In Progress", count: inProgressCount },
          { label: "Closed", count: closedCount },
          { label: "Total", count: tickets.length },
        ].map(({ label, count }) => (
          <div
            key={label}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-[13px] font-medium"
          >
            <span className="font-bold text-[15px] text-accent">{count}</span>
            {label}
          </div>
        ))}
      </div>

      <div className="flex gap-2.5 flex-wrap items-end">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="min-w-[170px] px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={assignmentFilter}
          onChange={(e) => setAssignmentFilter(e.target.value)}
          className="min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition"
        >
          <option value="">All assignments</option>
          <option value="mine">Assigned to Me</option>
          <option value="unassigned">Unassigned</option>
        </select>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3 opacity-30">📭</div>
          <p className="text-sm">No tickets match your filters.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} showCustomer />
          ))}
        </div>
      )}
    </div>
  );
}
