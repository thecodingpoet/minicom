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

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-left">
          <div className="header-logo" onClick={() => navigate(user?.role === "agent" ? "/agent" : "/")}>
            <div className="header-logo-icon">M</div>
            Minicom
          </div>
          {user?.role === "agent" && (
            <nav className="header-nav">
              <Link to="/agent" className={isActive("/agent") && !isActive("/agent/export") ? "active" : ""}>
                Inbox
              </Link>
              <Link to="/agent/export" className={isActive("/agent/export") ? "active" : ""}>
                Export
              </Link>
            </nav>
          )}
        </div>
        {user && (
          <div className="header-right">
            <div className="header-user">
              <Avatar name={user.fullName} size="sm" />
              <span>{user.fullName}</span>
            </div>
            <button className="header-logout" onClick={handleLogout}>
              Log out
            </button>
          </div>
        )}
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
