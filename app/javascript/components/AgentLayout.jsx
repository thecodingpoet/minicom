import { Outlet, useNavigate, useMatch } from "react-router-dom";
import UserMenu from "./UserMenu";
import NotificationBell from "./NotificationBell";
import AgentInbox from "../pages/agent/Dashboard";

export default function AgentLayout() {
  const navigate = useNavigate();
  const ticketMatch = useMatch("/agent/tickets/:id");
  const hasSelectedTicket = !!ticketMatch;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-5 h-14 flex items-center justify-between shrink-0 z-50">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/agent")}
        >
          <span className="text-lg font-bold text-accent tracking-tight">Minicom</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <UserMenu />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — ticket list (always visible on md+, hidden on mobile when viewing a ticket) */}
        <div
          className={`border-r border-gray-200 flex flex-col overflow-hidden bg-white shrink-0 w-full md:w-[380px] ${
            hasSelectedTicket ? "hidden md:flex" : "flex"
          }`}
        >
          <AgentInbox />
        </div>

        {/* Right panel — ticket detail or empty state */}
        <div
          className={`flex-1 flex flex-col overflow-hidden min-w-0 ${
            hasSelectedTicket ? "flex" : "hidden md:flex"
          }`}
        >
          <Outlet />
          {!hasSelectedTicket && (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-gray-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-sm font-medium">Select a conversation</p>
                <p className="text-xs mt-1 text-gray-300">
                  Choose a ticket from the inbox to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
