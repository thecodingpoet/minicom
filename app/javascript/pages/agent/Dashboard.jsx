import { useState, useEffect, useRef } from "react";
import { useQuery } from "@apollo/client/react";
import { useMatch } from "react-router-dom";
import { GET_TICKETS, GET_TICKET_COUNTS } from "../../graphql/queries";
import TicketCard from "../../components/TicketCard";
import Spinner from "../../components/Spinner";
import { createInboxSubscription } from "../../utils/actionCable";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "open", label: "Open", dot: "bg-green-500" },
  { value: "in_progress", label: "In Progress", dot: "bg-amber-500" },
  { value: "closed", label: "Closed", dot: "bg-gray-400" },
];

const ASSIGNMENT_OPTIONS = [
  { value: "", heading: "Inbox", menuLabel: "Everyone" },
  { value: "mine", heading: "My Inbox", menuLabel: "Mine" },
  { value: "unassigned", heading: "Unassigned", menuLabel: "Unassigned" },
];

function AssignmentDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = ASSIGNMENT_OPTIONS.find((o) => o.value === value) || ASSIGNMENT_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 text-[13px] text-gray-500 hover:text-gray-900 font-medium cursor-pointer border-none bg-transparent p-0 transition-colors"
      >
        {current.menuLabel}
        <svg
          className={`w-2.5 h-2.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 12 8"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 1l5 5 5-5" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
          {ASSIGNMENT_OPTIONS.map((option) => {
            const isActive = value === option.value;
            return (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-[13px] font-medium cursor-pointer border-none transition-colors flex items-center justify-between ${
                  isActive
                    ? "bg-accent/5 text-accent"
                    : "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {option.menuLabel}
                {isActive && (
                  <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AgentDashboard() {
  const [statusFilter, setStatusFilter] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("");
  const ticketMatch = useMatch("/agent/tickets/:id");
  const activeTicketId = ticketMatch?.params?.id;

  const { data, loading, error, refetch } = useQuery(GET_TICKETS, {
    variables: {
      status: statusFilter || undefined,
      assignment: assignmentFilter || undefined,
    },
  });

  const { data: countsData, refetch: refetchCounts } = useQuery(GET_TICKET_COUNTS, {
    variables: { assignment: assignmentFilter || undefined },
  });

  useEffect(() => {
    return createInboxSubscription(() => {
      refetch();
      refetchCounts();
    });
  }, [refetch, refetchCounts]);

  const tickets = data?.tickets || [];
  const counts = countsData?.ticketCounts;

  const countFor = (value) => {
    if (!counts) return 0;
    if (value === "open") return counts.open;
    if (value === "in_progress") return counts.inProgress;
    if (value === "closed") return counts.closed;
    return counts.all;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 px-5 pt-5 pb-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Inbox</h2>
            <span className="text-gray-300 text-lg leading-none" aria-hidden="true">•</span>
            <AssignmentDropdown
              value={assignmentFilter}
              onChange={setAssignmentFilter}
            />
          </div>
          <span className="text-[13px] text-gray-400 font-medium">{counts?.all ?? tickets.length}</span>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {STATUS_FILTERS.map(({ value, label, dot }) => {
            const active = statusFilter === value;
            const count = countFor(value);
            return (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer border-none ${
                  active
                    ? "bg-white text-gray-900 shadow-sm"
                    : "bg-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
                {label}
                {value && (
                  <span className={`ml-0.5 text-[10px] ${active ? "text-accent font-bold" : "text-gray-400"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto border-t border-gray-100">
        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="bg-red-50 text-red-500 px-3.5 py-2.5 rounded-lg text-[13px] font-medium m-4">
            {error.message}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3 opacity-30">📭</div>
            <p className="text-sm">No tickets match your filters.</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              showCustomer
              isActive={activeTicketId === ticket.id}
              basePath="/agent/tickets"
            />
          ))
        )}
      </div>
    </div>
  );
}
