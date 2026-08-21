import { apiFetch } from "../services/api";
import { useEffect, useState } from "react";

interface Room {
  _id: string;
  roomNumber: string;
  roomType: string;
  capacity: number;
  occupied: number;
  rent: number;
  utilitiesFee: number;
  status: string;
  availableBeds?: number;
}

interface Resident {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roomId: string | null;
  roomNumber: string | null;
  status: string;
}

function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [showAllocation, setShowAllocation] = useState(false);
  const [showRoomView, setShowRoomView] = useState(false);

  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [selectedResident, setSelectedResident] = useState("");

  const [formData, setFormData] = useState({
    roomNumber: "",
    roomType: "",
    capacity: "",
    occupied: "",
    rent: "",
    utilitiesFee: "",
  });

  // =========================
  // FETCH ROOMS
  // =========================

  const fetchRooms = async () => {
    try {
      const response = await apiFetch(
        "http://localhost:5000/api/rooms"
      );

      const result = await response.json();

      if (result.success) {
        setRooms(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    }
  };

  // =========================
  // FETCH RESIDENTS
  // =========================

  const fetchResidents = async () => {
    try {
      const response = await apiFetch(
        "http://localhost:5000/api/residents"
      );

      const result = await response.json();

      if (result.success) {
        setResidents(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch residents:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchResidents();
  }, []);

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (
  e: React.ChangeEvent<
    HTMLInputElement | HTMLSelectElement
  >
) => {
  const { name, value } = e.target;

  if (name === "capacity") {
    const newCapacity = Number(value);

    setFormData((prev) => ({
      ...prev,
      capacity: value,
      occupied:
        Number(prev.occupied || 0) > newCapacity
          ? String(newCapacity)
          : prev.occupied,
    }));

    return;
  }

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};
  // =========================
  // ADD / UPDATE ROOM
  // =========================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const capacity = Number(formData.capacity);
    const occupied = Number(formData.occupied);
    const rent = Number(formData.rent);
    const utilitiesFee = Number(formData.utilitiesFee);

    if (occupied > capacity) {
      alert(
        "Occupied beds cannot be greater than capacity"
      );
      return;
    }

    try {
      const url = editingRoom
        ? `http://localhost:5000/api/rooms/${editingRoom._id}`
        : "http://localhost:5000/api/rooms";

      const response = await apiFetch(url, {
        method: editingRoom ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomNumber: formData.roomNumber,
          roomType: formData.roomType,
          capacity,
          occupied,
          rent,
          utilitiesFee,
          status:
           editingRoom?.status === "Maintenance" ? "Maintenance"
           : occupied >= capacity ? "Occupied" : "Available",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(
          result.error ||
          result.message ||
          "Failed to save room"
        );
        return;
      }

      await fetchRooms();

      setFormData({
        roomNumber: "",
        roomType: "",
        capacity: "",
        occupied: "0",
        rent: "",
        utilitiesFee: "0",
      });

      setEditingRoom(null);
      setShowForm(false);

    } catch (error) {
      console.error("Failed to save room:", error);
      alert("Failed to connect to server");
    }
  };

  // =========================
  // EDIT ROOM
  // =========================

  const handleEdit = (room: Room) => {
    setEditingRoom(room);

    setFormData({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      capacity: String(room.capacity),
      occupied: String(room.occupied),
      rent: String(room.rent || 0),
      utilitiesFee: String(
        room.utilitiesFee || 0
      ),
    });

    setShowForm(true);
  };

  // =========================
  // DELETE ROOM
  // =========================

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this room?"
      )
    ) {
      return;
    }

    try {
      const response = await apiFetch(
        `http://localhost:5000/api/rooms/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        await fetchRooms();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(
        "Failed to delete room:",
        error
      );
    }
  };

  // =========================
  // OPEN ALLOCATION
  // =========================

  const openAllocation = (room: Room) => {
    setSelectedRoom(room);
    setSelectedResident("");
    setShowAllocation(true);
    fetchResidents();
  };

  // =========================
  // ALLOCATE ROOM
  // =========================

  const handleAllocate = async () => {
    if (!selectedRoom || !selectedResident) {
      alert("Please select a resident");
      return;
    }

    try {
      const response = await apiFetch(
        `http://localhost:5000/api/residents/${selectedResident}/allocate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomId: selectedRoom._id,
            checkInDate: new Date().toISOString(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(
          result.message ||
          result.error ||
          "Failed to allocate room"
        );
        return;
      }

      alert("Room allocated successfully!");

      setShowAllocation(false);
      setSelectedRoom(null);
      setSelectedResident("");

      await fetchRooms();
      await fetchResidents();

    } catch (error) {
      console.error(
        "Allocation error:",
        error
      );

      alert("Failed to connect to server");
    }
  };

  // =========================
  // CHECK OUT
  // =========================

  const handleCheckout = async (
    residentId: string
  ) => {
    if (
      !window.confirm(
        "Are you sure you want to check out this resident?"
      )
    ) {
      return;
    }

    try {
      const response = await apiFetch(
        `http://localhost:5000/api/residents/${residentId}/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            checkOutDate:
              new Date().toISOString(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(
          result.message ||
          "Checkout failed"
        );
        return;
      }

      alert("Resident checked out successfully!");

      await fetchRooms();
      await fetchResidents();

    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      alert("Failed to connect to server");
    }
  };

  const getAvailableBeds = (room: Room) => {
    return Math.max(
      0,
      room.capacity - room.occupied
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Rooms
          </h1>

          <p className="mt-1 text-gray-500">
            Manage hostel rooms and allocations
          </p>
        </div>

        <button
          onClick={() => {
            setEditingRoom(null);

            setFormData({
              roomNumber: "",
              roomType: "",
              capacity: "",
              occupied: "0",
              rent: "",
              utilitiesFee: "0",
            });

            setShowForm(true);
          }}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          + Add Room
        </button>

      </div>

      {/* ROOM TABLE */}

      <div className="overflow-hidden rounded-xl bg-white shadow">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-6 py-4 text-left">
                  Room
                </th>

                <th className="px-6 py-4 text-left">
                  Type
                </th>

                <th className="px-6 py-4 text-left">
                  Capacity
                </th>

                <th className="px-6 py-4 text-left">
                  Occupied
                </th>

                <th className="px-6 py-4 text-left">
                  Available
                </th>

                <th className="px-6 py-4 text-left">
                  Rent
                </th>

                <th className="px-6 py-4 text-left">
                  Status
                </th>

                <th className="px-6 py-4 text-left">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {rooms.map((room) => {

                const available =
                  getAvailableBeds(room);

                return (

                  <tr
                    key={room._id}
                    className="border-t"
                  >

                    <td className="px-6 py-4 font-medium">
                      {room.roomNumber}
                    </td>

                    <td className="px-6 py-4">
                      {room.roomType}
                    </td>

                    <td className="px-6 py-4">
                      {room.capacity}
                    </td>

                    <td className="px-6 py-4">
                      {room.occupied}
                    </td>

                    <td className="px-6 py-4 font-semibold text-green-600">
                      {available}
                    </td>

                    <td className="px-6 py-4">
                      ₹{room.rent || 0}
                    </td>

                    <td className="px-6 py-4">

                      {room.status === "Maintenance" ? (

                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
                          Maintenance
                        </span>

                      ) : available === 0 ? (

                        <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
                          Occupied
                        </span>

                      ) : (

                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                          Available
                        </span>

                      )}

                    </td>

                    <td className="px-6 py-4">

                      {available > 0 &&
                        room.status !== "Maintenance" && (

                          <button
                            onClick={() =>
                              openAllocation(room)
                            }
                            className="mr-3 font-medium text-green-600 hover:text-green-800"
                          >
                            Allocate
                          </button>

                        )}

                      <button
                        onClick={() => {
                          setSelectedRoom(room);
                          setShowRoomView(true);
                        }}
                        className="mr-3 text-indigo-600 hover:text-indigo-800"
                      >
                        View
                      </button>

                      <button
                        onClick={() =>
                          handleEdit(room)
                        }
                        className="mr-3 text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(room._id)
                        }
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                );
              })}

            </tbody>

          </table>

        </div>

        {rooms.length === 0 && (

          <div className="p-10 text-center text-gray-500">
            No rooms found.
          </div>

        )}

      </div>

      {/* CURRENT RESIDENTS */}

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow">

        <div className="border-b px-6 py-4">

          <h2 className="text-xl font-bold text-gray-800">
            Current Room Allocations
          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-6 py-4 text-left">
                  Resident
                </th>

                <th className="px-6 py-4 text-left">
                  Email
                </th>

                <th className="px-6 py-4 text-left">
                  Room
                </th>

                <th className="px-6 py-4 text-left">
                  Status
                </th>

                <th className="px-6 py-4 text-left">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {residents
                .filter(
                  (resident) =>
                    resident.roomId &&
                    resident.status === "Active"
                )
                .map((resident) => (

                  <tr
                    key={resident._id}
                    className="border-t"
                  >

                    <td className="px-6 py-4 font-medium">
                      {resident.firstName}{" "}
                      {resident.lastName}
                    </td>

                    <td className="px-6 py-4">
                      {resident.email}
                    </td>

                    <td className="px-6 py-4">
                      Room {resident.roomNumber}
                    </td>

                    <td className="px-6 py-4">

                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                        Active
                      </span>

                    </td>

                    <td className="px-6 py-4">

                      <button
                        onClick={() =>
                          handleCheckout(
                            resident._id
                          )
                        }
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                      >
                        Check-out
                      </button>

                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* ADD / EDIT ROOM MODAL */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold text-gray-800">
                {editingRoom
                  ? "Edit Room"
                  : "Add Room"}
              </h2>

              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingRoom(null);
                }}
                className="text-2xl text-gray-500">

                ×
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                placeholder="Room Number"
                required
                className="w-full rounded-lg border px-4 py-3"
              />

              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-4 py-3"
              >

                <option value="">
                  Select room type
                </option>

                <option value="Single">
                  Single
                </option>

                <option value="Double">
                  Double
                </option>

                <option value="Triple">
                  Triple
                </option>

                <option value="Dormitory">
                  Dormitory
                </option>

                <option value="Shared">
                  Shared
                </option>

              </select>

              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="Capacity"
                min="1"
                required
                className="w-full rounded-lg border px-4 py-3"
              />

             <input
  type="number"
  name="occupied"
  value={formData.occupied}
  readOnly
  className="w-full rounded-lg border bg-gray-100 px-4 py-3 text-gray-600"
/>

<p className="text-xs text-gray-500">
  Occupied beds are updated automatically when residents are allocated or checked out.
</p>

              <input
                type="number"
                name="rent"
                value={formData.rent}
                onChange={handleChange}
                placeholder="Monthly Rent"
                min="0"
                className="w-full rounded-lg border px-4 py-3"
              />

              <input
                type="number"
                name="utilitiesFee"
                value={formData.utilitiesFee}
                onChange={handleChange}
                placeholder="Utilities Fee"
                min="0"
                className="w-full rounded-lg border px-4 py-3"
              />

              <div className="flex justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRoom(null);
                  }}
                  className="rounded-lg border px-5 py-3"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white"
                >
                  {editingRoom
                    ? "Update Room"
                    : "Add Room"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ROOM VIEW MODAL */}

{showRoomView && selectedRoom && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

      {/* Header */}

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Room Details
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Room {selectedRoom.roomNumber}
          </p>
        </div>

        <button
          onClick={() => {
            setShowRoomView(false);
            setSelectedRoom(null);
          }}
          className="text-2xl text-gray-500 hover:text-gray-800"
        >
          ×
        </button>

      </div>

      {/* Room Details */}

      <div className="space-y-4">

        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-500">
            Room Number
          </span>

          <span className="font-semibold">
            {selectedRoom.roomNumber}
          </span>
        </div>

        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-500">
            Room Type
          </span>

          <span className="font-semibold">
            {selectedRoom.roomType}
          </span>
        </div>

        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-500">
            Capacity
          </span>

          <span className="font-semibold">
            {selectedRoom.capacity}
          </span>
        </div>

        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-500">
            Occupied Beds
          </span>

          <span className="font-semibold">
            {selectedRoom.occupied}
          </span>
        </div>

        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-500">
            Available Beds
          </span>

          <span className="font-semibold text-green-600">
            {getAvailableBeds(selectedRoom)}
          </span>
        </div>

        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-500">
            Monthly Rent
          </span>

          <span className="font-semibold">
            ₹{selectedRoom.rent || 0}
          </span>
        </div>

        <div className="flex justify-between border-b pb-3">
          <span className="text-gray-500">
            Utilities Fee
          </span>

          <span className="font-semibold">
            ₹{selectedRoom.utilitiesFee || 0}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">
            Status
          </span>

          {selectedRoom.status === "Maintenance" ? (
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
              Maintenance
            </span>
          ) : getAvailableBeds(selectedRoom) === 0 ? (
            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
              Occupied
            </span>
          ) : (
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              Available
            </span>
          )}

        </div>

      </div>

      {/* Close Button */}

      <div className="mt-6 flex justify-end">

        <button
          onClick={() => {
            setShowRoomView(false);
            setSelectedRoom(null);
          }}
          className="rounded-lg bg-gray-800 px-5 py-3 font-medium text-white hover:bg-gray-900"
        >
          Close
        </button>

      </div>

    </div>

  </div>
)}

      {/* ALLOCATION MODAL */}

      {showAllocation &&
        selectedRoom && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

              <div className="mb-5 flex items-center justify-between">

                <div>

                  <h2 className="text-2xl font-bold text-gray-800">
                    Allocate Room
                  </h2>

                  <p className="text-gray-500"> Room {selectedRoom.roomNumber} </p>

                </div>

                <button onClick={() => setShowAllocation(false)}
                  className="text-2xl text-gray-500">
                  x
                </button>

              </div>

              <div className="mb-5 rounded-Ig bg-gray-50 p-4">

                <p> <strong> Room: </strong> {" "} {selectedRoom.roomNumber} </p>

                <p> <strong> Type: </strong> {" "} {selectedRoom.roomType} </p>

                <p> <strong> Available Beds: </strong>{" "} {getAvailableBeds(selectedRoom)} </p>

              </div>

              <label className="mb-2 block font-medium text-gray-700">
                Select Resident
              </label>

              <select
                onChange={(e) => setSelectedResident(e.target.value)}
                value={selectedResident}
                className="mb-5 w-full rounded-lg border px-4 py-3"
              >
                <option value="">Select resident</option>

                {residents
                  .filter(
                    (resident) =>
                      resident.status === "Active" &&
                      !resident.roomId
                  )
                  .map((resident) => (
                    <option
                      key={resident._id}
                      value={resident._id}
                    >
                      {resident.firstName} {resident.lastName}
                    </option>
                  ))}
              </select>

              <div className="flex justify-end gap-3">

                <button

                  onClick={() => setShowAllocation(false)}





                  className="rounded-Ig border px-5 py-3"

                >

                  Cancel

                </button>

                <button

                  onClick={handleAllocate}

                  className="rounded-ig bg-green-600 px-5

py-3 font-medium text-white hover:bg-green-700"

                >

                  Allocate & Check-in

                </button>

              </div >

            </div >

          </div >

        )
      }

    </div >

  );

}

export default Rooms;