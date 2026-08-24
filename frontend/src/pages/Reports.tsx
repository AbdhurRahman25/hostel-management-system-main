import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

type Report = {
  totalRooms: number | null;
  capacity: number | null;
  occupied: number | null;
  availableBeds: number | null;
  occupancyRate: number | null;
  activeResidents: number | null;
  totalBilling: number | null;
  collected: number | null;
  pending: number | null;
   expenses: number | null;
    netRevenue: number | null;
  maintenanceTotal: number | null;
  maintenancePending: number | null;
  maintenanceCompleted: number | null;
  monthlyRevenue: {
    month: string;
    amount: number | null;
  }[];
};

const money = (value: number | null | undefined) =>
  `₹${Number(value ?? 0).toLocaleString("en-IN")}`;

const numberValue = (value: number | null | undefined) =>
  Number(value ?? 0);

export default function Reports() {
  const [data, setData] = useState<Report | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/reports/summary")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setData(d.data);
        } else {
          setError(d.message || "Unable to load reports");
        }
      })
      .catch(() => {
        setError("Unable to load reports");
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 shadow-sm">
          <p className="font-semibold">Unable to load reports</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-lg">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

            <p className="font-medium text-gray-700">
              Loading reports...
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Please wait
            </p>
          </div>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Rooms",
      value: numberValue(data.totalRooms),
      icon: "🏠",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      text: "text-blue-600",
    },
    {
      title: "Occupied Beds",
      value: numberValue(data.occupied),
      icon: "🛏️",
      bg: "bg-purple-50",
      iconBg: "bg-purple-100",
      text: "text-purple-600",
    },
    {
      title: "Available Beds",
      value: numberValue(data.availableBeds),
      icon: "🟢",
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      text: "text-green-600",
    },
    {
      title: "Occupancy",
      value: `${numberValue(data.occupancyRate)}%`,
      icon: "📊",
      bg: "bg-orange-50",
      iconBg: "bg-orange-100",
      text: "text-orange-600",
    },
    {
      title: "Active Residents",
      value: numberValue(data.activeResidents),
      icon: "👥",
      bg: "bg-cyan-50",
      iconBg: "bg-cyan-100",
      text: "text-cyan-600",
    },
    {
      title: "Total Billing",
      value: money(data.totalBilling),
      icon: "💰",
      bg: "bg-indigo-50",
      iconBg: "bg-indigo-100",
      text: "text-indigo-600",
    },
    {
      title: "Collected",
      value: money(data.collected),
      icon: "✅",
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      text: "text-emerald-600",
    },
    {
      title: "Pending",
      value: money(data.pending),
      icon: "⏳",
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      text: "text-red-600",
    },
    {
  title: "Expenses",
  value: money(data.expenses),
  icon: "💸",
  bg: "bg-rose-50",
  iconBg: "bg-rose-100",
  text: "text-rose-600",
},
{
  title: "Net Revenue",
  value: money(data.netRevenue),
  icon: "📈",
  bg: "bg-teal-50",
  iconBg: "bg-teal-100",
  text: "text-teal-600",
},
  ];

  const monthlyAmounts = data.monthlyRevenue.map((x) =>
    numberValue(x.amount)
  );

  const maxMonthlyAmount =
    monthlyAmounts.length > 0
      ? Math.max(...monthlyAmounts)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 p-4 sm:p-6">

      {/* ================= HEADER ================= */}

      <div className="mb-8">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-2xl shadow-lg">
                📊
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                  Financial & Operations Reports
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Overview of your hostel performance
                </p>
              </div>

            </div>
          </div>

          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">

            <div className="flex items-center gap-2">

              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

              <span className="text-sm font-medium text-green-700">
                Live Database
              </span>

            </div>

            <p className="mt-1 text-xs text-green-600">
              Data connected to MongoDB
            </p>

          </div>

        </div>

      </div>

      {/* ================= SUMMARY CARDS ================= */}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {cards.map((card) => (

          <div
            key={card.title}
            className={`group rounded-2xl ${card.bg} p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg`}
          >

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>

                <p
                  className={`mt-3 text-2xl font-bold ${card.text}`}
                >
                  {card.value}
                </p>

              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg} text-xl transition duration-300 group-hover:scale-110`}
              >
                {card.icon}
              </div>

            </div>

          </div>

        ))}

      </div>

      {/* ================= MAIN SECTIONS ================= */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ================= MAINTENANCE ================= */}

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md">

          <div className="border-b border-gray-100 px-6 py-5">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-gray-800">
                  Maintenance
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Current maintenance request status
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-xl">
                🔧
              </div>

            </div>

          </div>

          <div className="p-6">

            {/* Total */}

            <div className="mb-4 flex items-center justify-between rounded-xl bg-gray-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  📋
                </div>

                <div>

                  <p className="font-medium text-gray-700">
                    Total Requests
                  </p>

                  <p className="text-xs text-gray-400">
                    All maintenance requests
                  </p>

                </div>

              </div>

              <span className="text-xl font-bold text-gray-800">
                {numberValue(data.maintenanceTotal)}
              </span>

            </div>

            {/* Pending */}

            <div className="mb-4 flex items-center justify-between rounded-xl bg-yellow-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                  ⏳
                </div>

                <div>

                  <p className="font-medium text-gray-700">
                    Pending / In Progress
                  </p>

                  <p className="text-xs text-gray-400">
                    Requests that need attention
                  </p>

                </div>

              </div>

              <span className="text-xl font-bold text-yellow-600">
                {numberValue(data.maintenancePending)}
              </span>

            </div>

            {/* Completed */}

            <div className="flex items-center justify-between rounded-xl bg-green-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  ✓
                </div>

                <div>

                  <p className="font-medium text-gray-700">
                    Completed
                  </p>

                  <p className="text-xs text-gray-400">
                    Successfully completed requests
                  </p>

                </div>

              </div>

              <span className="text-xl font-bold text-green-600">
                {numberValue(data.maintenanceCompleted)}
              </span>

            </div>

          </div>

        </div>

        {/* ================= MONTHLY BILLING ================= */}

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md">

          <div className="border-b border-gray-100 px-6 py-5">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-gray-800">
                  Monthly Billing
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Revenue collected by month
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl">
                💰
              </div>

            </div>

          </div>

          <div className="p-6">

            {data.monthlyRevenue.length === 0 ? (

              <div className="flex min-h-[250px] items-center justify-center">

                <div className="text-center">

                  <div className="mb-3 text-4xl">
                    📈
                  </div>

                  <p className="font-medium text-gray-600">
                    No billing data yet
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    Monthly revenue will appear here
                  </p>

                </div>

              </div>

            ) : (

              <div className="space-y-5">

                {data.monthlyRevenue.map((item) => {

                  const amount = numberValue(item.amount);

                  const percentage =
                    maxMonthlyAmount > 0
                      ? (amount / maxMonthlyAmount) * 100
                      : 0;

                  return (
                    <div key={item.month}>

                      <div className="mb-2 flex items-center justify-between">

                        <span className="text-sm font-semibold text-gray-700">
                          {item.month}
                        </span>

                        <span className="text-sm font-bold text-gray-800">
                          {money(amount)}
                        </span>

                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-gray-100">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-700"
                          style={{
                            width: `${Math.min(
                              100,
                              percentage
                            )}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                })}

              </div>

            )}

          </div>

        </div>

      </div>

      {/* ================= FINANCIAL SUMMARY ================= */}

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

        <div className="mb-5 flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-xl">
            💳
          </div>

          <div>

            <h2 className="text-xl font-bold text-gray-800">
              Financial Summary
            </h2>

            <p className="text-sm text-gray-500">
              Current billing collection overview
            </p>

          </div>

        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Total */}

          <div className="rounded-xl bg-indigo-50 p-5">

            <p className="text-sm font-medium text-indigo-600">
              Total Billing
            </p>

            <p className="mt-2 text-2xl font-bold text-indigo-700">
              {money(data.totalBilling)}
            </p>

          </div>

          {/* Collected */}

          <div className="rounded-xl bg-green-50 p-5">

            <p className="text-sm font-medium text-green-600">
              Collected
            </p>

            <p className="mt-2 text-2xl font-bold text-green-700">
              {money(data.collected)}
            </p>

          </div>

          {/* Pending */}

          <div className="rounded-xl bg-red-50 p-5">

            <p className="text-sm font-medium text-red-600">
              Pending
            </p>

            <p className="mt-2 text-2xl font-bold text-red-700">
              {money(data.pending)}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}