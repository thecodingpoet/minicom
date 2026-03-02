import { useAuth } from "../utils/auth";
import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
import UserMenu from "./UserMenu";
import NotificationBell from "./NotificationBell";

export default function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate(user?.role === "agent" ? "/agent" : "/")}
          >
            <span className="text-lg font-bold text-accent tracking-tight">Minicom</span>
          </div>
          {user?.role === "agent" && (
            <nav className="flex gap-1">
              <Link
                to="/agent"
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                  location.pathname === "/agent"
                    ? "bg-accent-light text-accent"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                Inbox
              </Link>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <UserMenu />
        </div>
      </header>
      <main className="flex-1 w-full max-w-[1080px] mx-auto px-6 py-7">
        <Outlet />
      </main>
    </div>
  );
}
