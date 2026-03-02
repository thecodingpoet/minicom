import { useAuth } from "../utils/auth";
import { useNavigate, Outlet } from "react-router-dom";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-left">
          <h1 onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            Minicom
          </h1>
          {user && (
            <sl-badge variant="neutral" style={{ marginLeft: "12px" }}>
              {user.role}
            </sl-badge>
          )}
        </div>
        {user && (
          <div className="header-right">
            <span>Hello, {user.firstName}</span>
            <sl-button size="small" variant="text" onClick={handleLogout}>
              Logout
            </sl-button>
          </div>
        )}
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
