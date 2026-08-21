import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="min-h-screen w-64 bg-slate-900 p-5 text-white">
      <h2 className="mb-8 text-2xl font-bold">
        Hostel Management
      </h2>

      <nav className="space-y-2">

        <NavLink
          to="/"
          className={({ isActive }) =>
            `block w-full rounded-lg px-4 py-3 ${
              isActive
                ? "bg-slate-700"
                : "hover:bg-slate-800"
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/residents"
          className={({ isActive }) =>
            `block w-full rounded-lg px-4 py-3 ${
              isActive
                ? "bg-slate-700"
                : "hover:bg-slate-800"
            }`
          }
        >
          Residents
        </NavLink>

        <NavLink
          to="/rooms"
          className={({ isActive }) =>
            `block w-full rounded-lg px-4 py-3 ${
              isActive
                ? "bg-slate-700"
                : "hover:bg-slate-800"
            }`
          }
        >
          Rooms
        </NavLink>

        <NavLink
          to="/maintenance"
          className={({ isActive }) =>
            `block w-full rounded-lg px-4 py-3 ${
              isActive
                ? "bg-slate-700"
                : "hover:bg-slate-800"
            }`
          }
        >
          Maintenance
        </NavLink>

        <NavLink
          to="/billing"
          className={({ isActive }) =>
            `block w-full rounded-lg px-4 py-3 ${
              isActive
                ? "bg-slate-700"
                : "hover:bg-slate-800"
            }`
          }
        >
          Billing
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `block w-full rounded-lg px-4 py-3 ${
              isActive
                ? "bg-slate-700"
                : "hover:bg-slate-800"
            }`
          }
        >
          Reports
        </NavLink>

        <NavLink
          to="/users"
          className={({ isActive }) =>
            `block w-full rounded-lg px-4 py-3 ${
              isActive
                ? "bg-slate-700"
                : "hover:bg-slate-800"
            }`
          }
        >
          Users
        </NavLink>

      <button onClick={() => { localStorage.clear(); location.href="/login"; }} className="mt-8 w-full rounded-lg bg-red-600 px-4 py-3 text-left hover:bg-red-700">Logout</button>
      
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `block w-full rounded-lg px-4 py-3 ${isActive ? "bg-slate-700" : "hover:bg-slate-800"}`
          }
        >
          Notifications
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;