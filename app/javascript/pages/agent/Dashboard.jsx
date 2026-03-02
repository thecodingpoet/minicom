import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_TICKETS } from "../../graphql/queries";
import TicketCard from "../../components/TicketCard";
import Spinner from "../../components/Spinner";
import { createInboxSubscription } from "../../utils/actionCable";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "open", label: "Open", dot: "bg-green-500" },
  { value: "in_progress", label: "In Progress", dot: "bg-amber-500" },
  { value: "closed", label: "Closed", dot: "bg-gray-400" },
];

const ASSIGNMENT_FILTERS = [
  { value: "", label: "All" },
  { value: "mine", label: "Mine" },
  { value: "unassigned", label: "Unassigned" },
];

export default function AgentDashboard() {
  const [statusFilter, setStatusFilter] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("");

  const { data, loading, error, refetch } = useQuery(GET_TICKETS, {
    variables: {
      status: statusFilter || undefined,
      assignment: assignmentFilter || undefined,
    },
  });

  useEffect(() => {
    return createInboxSubscription(() => refetch());
  }, [refetch]);

  if (loading) return <Spinner />;
  if (error) return <div className="bg-red-50 text-red-500 px-3.5 py-2.5 rounded-lg text-[13px] font-medium">{error.message}</div>;

  const tickets = data?.tickets || [];
  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const closedCount = tickets.filter((t) => t.status === "closed").length;

  const countFor = (value) => {
    if (value === "open") return openCount;
    if (value === "in_progress") return inProgressCount;
    if (value === "closed") return closedCount;
    return tickets.length;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Inbox</h2>
        <span className="text-[13px] text-gray-400 font-medium">{tickets.length} conversations</span>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Status filter pills */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {STATUS_FILTERS.map(({ value, label, dot }) => {
            const active = statusFilter === value;
            const count = countFor(value);
            return (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all cursor-pointer border-none ${
                  active
                    ? "bg-white text-gray-900 shadow-sm"
                    : "bg-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {dot && <span className={`w-2 h-2 rounded-full ${dot}`} />}
                {label}
                {value && (
                  <span className={`ml-0.5 text-[11px] ${active ? "text-accent font-bold" : "text-gray-400"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Assignment filter toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {ASSIGNMENT_FILTERS.map(({ value, label }) => {
            const active = assignmentFilter === value;
            return (
              <button
                key={value}
                onClick={() => setAssignmentFilter(value)}
                className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-all cursor-pointer border-none ${
                  active
                    ? "bg-white text-gray-900 shadow-sm"
                    : "bg-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
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
