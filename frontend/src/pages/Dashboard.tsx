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
          const residents: Resident[] = residentsResult.data;

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
    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="mb-6 text-3xl font-bold text-gray-800">
        Hostel Management Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

        {/* Total Rooms */}
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Total Rooms
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {totalRooms}
          </h2>
        </div>

        {/* Available Beds */}
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Available Beds
          </p>

          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {availableRooms}
          </h2>
        </div>

        {/* Occupied Beds */}
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Occupied Beds
          </p>

          <h2 className="mt-2 text-3xl font-bold text-blue-600">
            {occupiedRooms}
          </h2>
        </div>

        {/* Total Residents */}
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Active Residents
          </p>

          <h2 className="mt-2 text-3xl font-bold text-purple-600">
            {totalResidents}
          </h2>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;