import { apiFetch } from "../services/api";
import { useEffect, useState } from "react";

interface Room {
  capacity: number;
  occupied: number;
}

interface Resident {
  status: string;
}

function Dashboard() {
  const [totalRooms, setTotalRooms] = useState(0);
  const [availableRooms, setAvailableRooms] = useState(0);
  const [occupiedRooms, setOccupiedRooms] = useState(0);
  const [totalResidents, setTotalResidents] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [roomsResponse, residentsResponse] =
          await Promise.all([
            apiFetch("/api/rooms"),
            apiFetch("/api/residents"),
          ]);

        const roomsResult = await roomsResponse.json();
        const residentsResult = await residentsResponse.json();

        if (roomsResult.success) {
          const rooms: Room[] = roomsResult.data;

          setTotalRooms(rooms.length);

          const available = rooms.reduce(
            (total, room) =>
              total + (room.capacity - room.occupied),
            0
          );

          const occupied = rooms.reduce(
            (total, room) => total + room.occupied,
            0
          );

          setAvailableRooms(available);
          setOccupiedRooms(occupied);
        }

        if (residentsResult.success) {
          const residents: Resident[] =
            residentsResult.data;

          const activeResidents = residents.filter(
            (resident) => resident.status === "Active"
          );

          setTotalResidents(activeResidents.length);
        }
      } catch (error) {
        console.error(
          "Failed to fetch dashboard data:",
          error
        );
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-blue-600">
              Overview
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
              Hostel Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Monitor rooms, beds and residents from one place.
            </p>
          </div>

          {/* Dashboard Icon */}
          <div className="hidden h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-3xl text-white shadow-lg sm:flex">
            🏠
          </div>

        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total Rooms */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white p-6 shadow-lg shadow-slate-200/60 transition duration-300 hover:-translate-y-1 hover:shadow-xl">

          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-blue-50" />

          <div className="relative">

            <div className="mb-5 flex items-center justify-between">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                🏢
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                Rooms
              </span>

            </div>

            <p className="text-sm font-medium text-slate-500">
              Total Rooms
            </p>

            <h2 className="mt-1 text-4xl font-bold text-slate-800">
              {totalRooms}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Rooms available in hostel
            </p>

          </div>
        </div>

        {/* Available Beds */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white p-6 shadow-lg shadow-slate-200/60 transition duration-300 hover:-translate-y-1 hover:shadow-xl">

          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-green-50" />

          <div className="relative">

            <div className="mb-5 flex items-center justify-between">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
                🛏️
              </div>

              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                Available
              </span>

            </div>

            <p className="text-sm font-medium text-slate-500">
              Available Beds
            </p>

            <h2 className="mt-1 text-4xl font-bold text-green-600">
              {availableRooms}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Beds ready for allocation
            </p>

          </div>
        </div>

        {/* Occupied Beds */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white p-6 shadow-lg shadow-slate-200/60 transition duration-300 hover:-translate-y-1 hover:shadow-xl">

          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-indigo-50" />

          <div className="relative">

            <div className="mb-5 flex items-center justify-between">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
                👥
              </div>

              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                Occupied
              </span>

            </div>

            <p className="text-sm font-medium text-slate-500">
              Occupied Beds
            </p>

            <h2 className="mt-1 text-4xl font-bold text-indigo-600">
              {occupiedRooms}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Currently occupied beds
            </p>

          </div>
        </div>

        {/* Active Residents */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white p-6 shadow-lg shadow-slate-200/60 transition duration-300 hover:-translate-y-1 hover:shadow-xl">

          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-purple-50" />

          <div className="relative">

            <div className="mb-5 flex items-center justify-between">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                🎓
              </div>

              <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600">
                Active
              </span>

            </div>

            <p className="text-sm font-medium text-slate-500">
              Active Residents
            </p>

            <h2 className="mt-1 text-4xl font-bold text-purple-600">
              {totalResidents}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              Currently active residents
            </p>

          </div>
        </div>

      </div>

      {/* Quick Overview */}
      <div className="mt-8 rounded-2xl border border-white/70 bg-white p-6 shadow-lg shadow-slate-200/60">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
            📊
          </div>

          <div>
            <h2 className="font-bold text-slate-800">
              Hostel Overview
            </h2>

            <p className="text-sm text-slate-500">
              Current occupancy summary
            </p>
          </div>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-400">
              Total Capacity
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-700">
              {availableRooms + occupiedRooms}
            </p>
          </div>

          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-xs font-medium text-green-600">
              Available
            </p>

            <p className="mt-1 text-2xl font-bold text-green-700">
              {availableRooms}
            </p>
          </div>

          <div className="rounded-xl bg-indigo-50 p-4">
            <p className="text-xs font-medium text-indigo-600">
              Occupied
            </p>

            <p className="mt-1 text-2xl font-bold text-indigo-700">
              {occupiedRooms}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;