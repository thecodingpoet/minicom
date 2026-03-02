import { useQuery } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import { GET_TICKETS } from "../../graphql/queries";
import TicketCard from "../../components/TicketCard";
import Spinner from "../../components/Spinner";

export default function CustomerDashboard() {
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(GET_TICKETS);

  if (loading) return <Spinner />;
  if (error) return <div className="bg-red-50 text-red-500 px-3.5 py-2.5 rounded-lg text-[13px] font-medium">{error.message}</div>;

  const tickets = data?.tickets || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Your conversations</h2>
        <button
          onClick={() => navigate("/tickets/new")}
          className="bg-accent hover:bg-accent-hover text-white font-semibold px-4 py-2 rounded-lg text-sm transition"
        >
          New conversation
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3 opacity-30">💬</div>
          <p className="text-sm">No conversations yet. Start one!</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
