import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./utils/auth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import CustomerDashboard from "./pages/customer/Dashboard";
import CreateTicket from "./pages/customer/CreateTicket";
import CustomerTicketDetail from "./pages/customer/TicketDetail";
import AgentDashboard from "./pages/agent/Dashboard";
import AgentTicketDetail from "./pages/agent/TicketDetail";
import Export from "./pages/agent/Export";

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <sl-spinner style={{ fontSize: "2rem" }} />;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <sl-spinner style={{ fontSize: "2rem" }} />;
  if (!user) return <Navigate to="/login" />;
  if (user.role === "agent") return <Navigate to="/agent" />;

  return <CustomerDashboard />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      <Route element={<Layout />}>
        <Route path="/" element={<RootRedirect />} />

        {/* Customer routes */}
        <Route
          path="/tickets/new"
          element={
            <PrivateRoute role="customer">
              <CreateTicket />
            </PrivateRoute>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <PrivateRoute>
              <TicketDetailRouter />
            </PrivateRoute>
          }
        />

        {/* Agent routes */}
        <Route
          path="/agent"
          element={
            <PrivateRoute role="agent">
              <AgentDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/agent/export"
          element={
            <PrivateRoute role="agent">
              <Export />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
}

function TicketDetailRouter() {
  const { user } = useAuth();
  if (user?.role === "agent") return <AgentTicketDetail />;
  return <CustomerTicketDetail />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
