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
      .catch(() => setError("Unable to load reports"));
  }, []);

  if (error) {
    return (
      <div className="p-6 text-red-600">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        Loading reports...
      </div>
    );
  }

  const cards = [
    ["Total Rooms", numberValue(data.totalRooms)],
    ["Occupied Beds", numberValue(data.occupied)],
    ["Available Beds", numberValue(data.availableBeds)],
    `["Occupancy", ${numberValue(data.occupancyRate)}%]`,
    ["Active Residents", numberValue(data.activeResidents)],
    ["Total Billing", money(data.totalBilling)],
    ["Collected", money(data.collected)],
    ["Pending", money(data.pending)],
  ];

  const monthlyAmounts = data.monthlyRevenue.map((x) =>
    numberValue(x.amount)
  );

  const maxMonthlyAmount =
    monthlyAmounts.length > 0
      ? Math.max(...monthlyAmounts)
      : 0;

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Financial & Operations Reports
        </h1>

        <p className="text-gray-500">
          Live data from your MongoDB database
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {cards.map(([key, value]) => (
          <div
            key={String(key)}
            className="rounded-xl bg-white p-5 shadow"
          >
            <p className="text-sm text-gray-500">
              {key}
            </p>

            <p className="mt-2 text-2xl font-bold">
              {value}
            </p>
          </div>
        ))}

      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">

        {/* Maintenance */}

        <div className="rounded-xl bg-white p-6 shadow">

          <h2 className="mb-4 text-xl font-semibold">
            Maintenance
          </h2>

          <div className="flex justify-between border-b py-3">
            <span>Total</span>
            <b>{numberValue(data.maintenanceTotal)}</b>
          </div>

          <div className="flex justify-between border-b py-3">
            <span>Pending / In Progress</span>
            <b>{numberValue(data.maintenancePending)}</b>
          </div>

          <div className="flex justify-between py-3">
            <span>Completed</span>
            <b>{numberValue(data.maintenanceCompleted)}</b>
          </div>

        </div>

        {/* Monthly Billing */}

        <div className="rounded-xl bg-white p-6 shadow">

          <h2 className="mb-4 text-xl font-semibold">
            Monthly Billing
          </h2>

          {data.monthlyRevenue.length === 0 ? (

            <p className="text-gray-500">
              No billing data yet.
            </p>

          ) : (

            data.monthlyRevenue.map((item) => {

              const amount = numberValue(item.amount);

              const percentage =
                maxMonthlyAmount > 0
                  ? (amount / maxMonthlyAmount) * 100
                  : 0;

              return (
                <div
                  key={item.month}
                  className="mb-3"
                >

                  <div className="mb-1 flex justify-between text-sm">

                    <span>
                      {item.month}
                    </span>

                    <span>
                      {money(amount)}
                    </span>

                  </div>

                  <div className="h-3 rounded-full bg-gray-200">

                    <div
                      className="h-3 rounded-full bg-blue-600"
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
            })
          )}

        </div>

      </div>

    </div>
  );
}