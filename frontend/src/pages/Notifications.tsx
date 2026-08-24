import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

type Item = {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export default function Notifications() {
  const [items, setItems] = useState<Item[]>([]);

  const load = () =>
    apiFetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => d.success && setItems(d.data));

  useEffect(() => {
    load();
  }, []);

  const read = async (id: string) => {
    await apiFetch(`/api/notifications/${id}/read`, {
      method: "PUT",
    });

    load();
  };

  const unreadCount = items.filter((item) => !item.isRead).length;

  const getTypeStyle = (type: string) => {
    switch (type?.toLowerCase()) {
      case "billing":
        return {
          icon: "₹",
          bg: "bg-green-100",
          text: "text-green-700",
          badge: "bg-green-50 text-green-700",
        };

      case "maintenance":
        return {
          icon: "🔧",
          bg: "bg-orange-100",
          text: "text-orange-700",
          badge: "bg-orange-50 text-orange-700",
        };

      case "system":
        return {
          icon: "⚙️",
          bg: "bg-purple-100",
          text: "text-purple-700",
          badge: "bg-purple-50 text-purple-700",
        };

      default:
        return {
          icon: "🔔",
          bg: "bg-blue-100",
          text: "text-blue-700",
          badge: "bg-blue-50 text-blue-700",
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg shadow-blue-200">
              🔔
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-800">
                Notifications
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Billing, maintenance and system alerts
              </p>
            </div>
          </div>
        </div>

        {/* Unread count */}
        <div className="flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-gray-100">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>

          <span className="text-sm font-medium text-gray-600">
            {unreadCount} unread
          </span>
        </div>

      </div>

      {/* Notifications */}
      <div className="mx-auto max-w-5xl">

        {items.length === 0 ? (

          /* Empty State */
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-4xl">
              🔔
            </div>

            <h2 className="text-xl font-semibold text-gray-800">
              No notifications
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              You're all caught up! New alerts will appear here.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {items.map((n) => {

              const style = getTypeStyle(n.type);

              return (
                <div
                  key={n._id}
                  className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                    n.isRead
                      ? "border-gray-100 opacity-70"
                      : "border-blue-100 shadow-blue-100/50"
                  }`}
                >

                  {/* Unread indicator */}
                  {!n.isRead && (
                    <div className="absolute left-0 top-0 h-full w-1 bg-blue-600" />
                  )}

                  <div className="flex gap-4">

                    {/* Icon */}
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${style.bg} ${style.text}`}
                    >
                      {style.icon}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-base font-semibold text-gray-800">
                              {n.title}
                            </h3>

                            {/* Type Badge */}
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style.badge}`}
                            >
                              {n.type || "General"}
                            </span>

                            {!n.isRead && (
                              <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-medium text-white">
                                New
                              </span>
                            )}

                          </div>

                          <p className="mt-2 text-sm leading-6 text-gray-600">
                            {n.message}
                          </p>

                          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                            <span>🕐</span>

                            <span>
                              {new Date(
                                n.createdAt
                              ).toLocaleString()}
                            </span>
                          </div>

                        </div>

                        {/* Mark Read */}
                        {!n.isRead && (
                          <button
                            onClick={() => read(n._id)}
                            className="shrink-0 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                          >
                            Mark as read
                          </button>
                        )}

                      </div>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </div>

    </div>
  );
}