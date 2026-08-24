import { NavLink } from "react-router-dom";

type Role = "admin" | "manager" | "staff" | "resident";

interface MenuItem {
  to: string;
  label: string;
  icon: string;
  roles: Role[];
}

function Sidebar() {

  // Login time-la user information localStorage-la save pannirundha
  const user = JSON.parse(localStorage.getItem("hostel_user") || "null");

  const role: Role = user?.role?.toLowerCase() ||"resident";

  const menuItems: MenuItem[] = [
    {
      to: "/",
      label: "Dashboard",
      icon: "🏠",
      roles: ["admin", "manager", "staff", "resident"],
    },
    {
      to: "/residents",
      label: "Residents",
      icon: "👥",
      roles: ["admin", "manager", "staff"],
    },
    {
      to: "/rooms",
      label: "Rooms",
      icon: "🛏️",
      roles: ["admin", "manager", "staff", "resident"],
    },
    {
      to: "/maintenance",
      label: "Maintenance",
      icon: "🔧",
      roles: ["admin", "manager", "staff", "resident"],
    },
    {
      to: "/billing",
      label: "Billing",
      icon: "💳",
      roles: ["admin", "manager", "resident"],
    },
    {
      to: "/reports",
      label: "Reports",
      icon: "📊",
      roles: ["admin", "manager"],
    },
    {
      to: "/users",
      label: "Users",
      icon: "👤",
      roles: ["admin", "manager"],
    },
    {
      to: "/notifications",
      label: "Notifications",
      icon: "🔔",
      roles: ["admin", "manager", "staff", "resident"],
    },
  ];

  // Current user role-ku allowed menus mattum
  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <aside className="flex min-h-screen w-72 flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-5 text-white shadow-2xl">

      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-2xl shadow-lg shadow-blue-500/30">
            🏨
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-wide">
              Hostel
            </h2>

            <p className="text-sm text-slate-400">
              Management System
            </p>
          </div>

        </div>
      </div>

      <div className="mb-5 h-px bg-slate-800" />

      {/* Navigation */}
      <nav className="flex-1 space-y-2">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Main Menu
        </p>

        {visibleMenuItems.map((item) => (

          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition ${
                    isActive
                      ? "bg-white/15"
                      : "bg-slate-800 group-hover:bg-slate-700"
                  }`}
                >
                  {item.icon}
                </span>

                <span className="flex-1">
                  {item.label}
                </span>

                {isActive && (
                  <span className="text-lg">
                    ›
                  </span>
                )}
              </>
            )}
          </NavLink>

        ))}

      </nav>

      {/* User Card */}
      <div className="mt-6 border-t border-slate-800 pt-5">

        <div className="mb-4 rounded-2xl bg-slate-800/70 p-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0">

              <p className="truncate text-sm font-semibold">
                {user?.name || "User"}
              </p>

              <p className="text-xs text-blue-400">
                {role}
              </p>

            </div>

          </div>

        </div>

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.clear();
            location.href = "/login";
          }}
          className="group flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300"
        >

          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-lg group-hover:bg-red-500/20">
            🚪
          </span>

          <span>
            Logout
          </span>

        </button>

      </div>

    </aside>
  );
}

export default Sidebar;