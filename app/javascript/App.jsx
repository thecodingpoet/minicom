import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "./utils/auth";
import { ROLES } from "./constants/roles";
import Layout from "./components/Layout";
import AgentLayout from "./components/AgentLayout";
import Spinner from "./components/Spinner";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Settings from "./pages/Settings";
import CustomerDashboard from "./pages/customer/Dashboard";
import CreateTicket from "./pages/customer/CreateTicket";
import CustomerTicketDetail from "./pages/customer/TicketDetail";
import AgentTicketDetail from "./pages/agent/TicketDetail";

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;
  if (user.role === ROLES.AGENT) return <Navigate to="/agent" />;

  return <CustomerDashboard />;
}

function TicketDetailRouter() {
  const { user } = useAuth();
  const { id } = useParams();
  if (user?.role === ROLES.AGENT) return <Navigate to={`/agent/tickets/${id}`} replace />;
  return <CustomerTicketDetail />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      <Route
        path="/agent"
        element={
          <PrivateRoute role={ROLES.AGENT}>
            <AgentLayout />
          </PrivateRoute>
        }
      >
        <Route index element={null} />
        <Route path="tickets/:id" element={<AgentTicketDetail />} />
      </Route>

      <Route element={<Layout />}>
        <Route path="/" element={<RootRedirect />} />

        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />

        <Route
          path="/tickets/new"
          element={
            <PrivateRoute role={ROLES.CUSTOMER}>
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
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
