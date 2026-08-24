import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Residents from "./pages/Residents";
import Rooms from "./pages/Rooms";
import Maintenance from "./pages/Maintenance";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Notifications from "./pages/Notifications";

import Login from "./pages/Login";
import Register from "./pages/Register";

type Role = "admin" | "manager" | "staff" | "resident";

function Protected({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: Role[];
}) {
  const token = localStorage.getItem("hostel_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(
    localStorage.getItem("hostel_user") || "null"
  );

  const role = user?.role?.toLowerCase() as Role;

  // If no specific roles are given,
  // any logged-in user can access
  if (!allowedRoles) {
    return <>{children}</>;
  }

  // Check whether current user's role is allowed
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1">
        <Routes>

          {/* Everyone */}
          <Route
            path="/"
            element={
              <Protected
                allowedRoles={[
                  "admin",
                  "manager",
                  "staff",
                  "resident",
                ]}
              >
                <Dashboard />
              </Protected>
            }
          />

          {/* Admin + Manager + Staff */}
          <Route
            path="/residents"
            element={
              <Protected
                allowedRoles={[
                  "admin",
                  "manager",
                  "staff",
                ]}
              >
                <Residents />
              </Protected>
            }
          />

          {/* Everyone */}
          <Route
            path="/rooms"
            element={
              <Protected
                allowedRoles={[
                  "admin",
                  "manager",
                  "staff",
                  "resident",
                ]}
              >
                <Rooms />
              </Protected>
            }
          />

          {/* Everyone */}
          <Route
            path="/maintenance"
            element={
              <Protected
                allowedRoles={[
                  "admin",
                  "manager",
                  "staff",
                  "resident",
                ]}
              >
                <Maintenance />
              </Protected>
            }
          />

          {/* Admin + Manager + Resident */}
          <Route
            path="/billing"
            element={
              <Protected
                allowedRoles={[
                  "admin",
                  "manager",
                  "resident",
                ]}
              >
                <Billing />
              </Protected>
            }
          />

          {/* Admin + Manager */}
          <Route
            path="/reports"
            element={
              <Protected
                allowedRoles={[
                  "admin",
                  "manager",
                ]}
              >
                <Reports />
              </Protected>
            }
          />

          {/* Admin + Manager */}
          <Route
            path="/users"
            element={
              <Protected
                allowedRoles={[
                  "admin",
                  "manager",
                ]}
              >
                <Users />
              </Protected>
            }
          />

          {/* Everyone */}
          <Route
            path="/notifications"
            element={
              <Protected
                allowedRoles={[
                  "admin",
                  "manager",
                  "staff",
                  "resident",
                ]}
              >
                <Notifications />
              </Protected>
            }
          />

        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Protected application */}
        <Route
          path="/*"
          element={
            <Protected>
              <Layout />
            </Protected>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;