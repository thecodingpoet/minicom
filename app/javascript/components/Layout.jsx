import { useAuth } from "../utils/auth";
import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
import Avatar from "./Avatar";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const navLink = (to, label, active) => (
    <Link
      to={to}
      className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
        active
          ? "bg-accent-light text-accent"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate(user?.role === "agent" ? "/agent" : "/")}
          >
            <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center text-white text-sm font-bold">
              M
            </div>
            <span className="text-lg font-bold text-accent tracking-tight">Minicom</span>
          </div>
          {user?.role === "agent" && (
            <nav className="flex gap-1">
              {navLink("/agent", "Inbox", isActive("/agent") && !isActive("/agent/export"))}
              {navLink("/agent/export", "Export", isActive("/agent/export"))}
            </nav>
          )}
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 text-[13px] text-gray-500">
              <Avatar name={user.fullName} size="sm" />
              <span>{user.fullName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-[13px] font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 px-2.5 py-1 rounded-md transition-colors border-none bg-transparent cursor-pointer"
            >
              Log out
            </button>
          </div>
        )}
      </header>
      <main className="flex-1 w-full max-w-[1080px] mx-auto px-6 py-7">
        <Outlet />
      </main>
    </div>
  );
}
