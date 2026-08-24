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
    occupied: "0",
    rent: "",
    utilitiesFee: "0",
  });

  // =========================
  // FETCH ROOMS
  // =========================

  const fetchRooms = async () => {
    try {
      const response = await apiFetch("http://localhost:5000/api/rooms");
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const capacity = Number(formData.capacity);
    const occupied = Number(formData.occupied);
    const rent = Number(formData.rent);
    const utilitiesFee = Number(formData.utilitiesFee);

    if (occupied > capacity) {
      alert("Occupied beds cannot be greater than capacity");
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
            editingRoom?.status === "Maintenance"
              ? "Maintenance"
              : occupied >= capacity
                ? "Occupied"
                : "Available",
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
      utilitiesFee: String(room.utilitiesFee || 0),
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
      console.error("Failed to delete room:", error);
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
      console.error("Allocation error:", error);
      alert("Failed to connect to server");
    }
  };

  // =========================
  // CHECK OUT
  // =========================

  const handleCheckout = async (residentId: string) => {
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
            checkOutDate: new Date().toISOString(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.message || "Checkout failed");
        return;
      }

      alert("Resident checked out successfully!");

      await fetchRooms();
      await fetchResidents();
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to connect to server");
    }
  };

  const getAvailableBeds = (room: Room) => {
    return Math.max(0, room.capacity - room.occupied);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">

      {/* ================= HEADER ================= */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-2xl text-white shadow-lg">
              🏠
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                Rooms
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage hostel rooms and allocations
              </p>
            </div>
          </div>
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
          className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
        >
          + Add Room
        </button>

      </div>

      {/* ================= ROOM SUMMARY ================= */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-lg">
          <p className="text-sm font-medium text-slate-500">
            Total Rooms
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {rooms.length}
          </p>
        </div>

        <div className="rounded-2xl border border-green-100 bg-white/90 p-5 shadow-lg">
          <p className="text-sm font-medium text-slate-500">
            Available Beds
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {rooms.reduce(
              (total, room) =>
                total + getAvailableBeds(room),
              0
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-white/90 p-5 shadow-lg">
          <p className="text-sm font-medium text-slate-500">
            Occupied Beds
          </p>

          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {rooms.reduce(
              (total, room) =>
                total + room.occupied,
              0
            )}
          </p>
        </div>

      </div>

      {/* ================= ROOM TABLE ================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-xl backdrop-blur-sm">

        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-5">

          <h2 className="text-xl font-bold text-slate-800">
            Room Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View availability, rent and room status
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-50">

              <tr>

                {[
                  "Room",
                  "Type",
                  "Capacity",
                  "Occupied",
                  "Available",
                  "Rent",
                  "Status",
                  "Action",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    {heading}
                  </th>
                ))}

              </tr>

            </thead>

            <tbody>

              {rooms.map((room) => {

                const available =
                  getAvailableBeds(room);

                return (
                  <tr
                    key={room._id}
                    className="border-t border-slate-100 transition hover:bg-blue-50/50"
                  >

                    <td className="px-6 py-4">
                      <span className="font-bold text-blue-600">
                        Room {room.roomNumber}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                        {room.roomType}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {room.capacity}
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {room.occupied}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-green-50 px-3 py-1.5 font-bold text-green-700">
                        {available}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-700">
                      ₹{room.rent || 0}
                    </td>

                    <td className="px-6 py-4">

                      {room.status === "Maintenance" ? (

                        <span className="rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-bold text-yellow-700">
                          Maintenance
                        </span>

                      ) : available === 0 ? (

                        <span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
                          Occupied
                        </span>

                      ) : (

                        <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                          Available
                        </span>

                      )}

                    </td>

                    <td className="px-6 py-4">

                      <div className="flex flex-wrap gap-2">

                        {available > 0 &&
                          room.status !== "Maintenance" && (
                            <button
                              onClick={() =>
                                openAllocation(room)
                              }
                              className="rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100"
                            >
                              Allocate
                            </button>
                          )}

                        <button
                          onClick={() => {
                            setSelectedRoom(room);
                            setShowRoomView(true);
                          }}
                          className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                        >
                          View
                        </button>

                        <button
                          onClick={() =>
                            handleEdit(room)
                          }
                          className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(room._id)
                          }
                          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

        {rooms.length === 0 && (
          <div className="p-12 text-center">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
              🏠
            </div>

            <p className="font-semibold text-slate-700">
              No rooms found
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Add your first room to get started
            </p>

          </div>
        )}

      </div>

      {/* ================= CURRENT ALLOCATIONS ================= */}

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-xl">

        <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5">

          <h2 className="text-xl font-bold text-slate-800">
            Current Room Allocations
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Residents currently assigned to rooms
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-50">

              <tr>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Resident
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Email
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Room
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
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
                    className="border-t border-slate-100 transition hover:bg-blue-50/50"
                  >

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full 
                        bg-gradient-to-br from-blue-500 to-indigo-500 font-bold text-white">
                          {resident.firstName
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <span className="font-semibold text-slate-700">
                          {resident.firstName}{" "}
                          {resident.lastName}
                        </span>

                      </div>

                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {resident.email}
                    </td>

                    <td className="px-6 py-4">

                      <span className="rounded-lg bg-blue-50 px-3 py-1.5 font-semibold 
                      text-blue-700">
                        Room {resident.roomNumber}
                      </span>

                    </td>

                    <td className="px-6 py-4">
                    <span className="rounded-full

bg-green-100 px-3 py-1.5 text-xs font-bold

text-green-700">

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

className="rounded-Ig bg-red-50 px-4

py-2 text-sm font-semibold text-red-600 transition

hover:bg-red-100"

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

{/* ================= ADD / EDIT ROOM

MODAL ================= */}

  {
    showForm && (

<div className="fixed inset-0 z-50 flex

items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">

<div className="w-full max-w-lg rounded-3xl border border-white/50 bg-white p-7 shadow-2xl">

<div className="mb-6 flex items-center

justify-between">

<div>

<h2 className="text-2xl font-bold

text-slate-800">

{editingRoom

? "Edit Room"

: "Add New Room"}

</h2>

<p className="mt-1 text-sm text-slate-500">

Enter room information below

</p>

</div>

<button

type="button"

onClick={() => {



setShowForm(false);

setEditingRoom(null);
}}

className="flex h-9 w-9 items-center

justify-center rounded-full bg-slate-100 text-xl text-slate-500 transition hover:bg-red-100

hover:text-red-600"

>

X

</button>

</div>
<form

onSubmit={handleSubmit}

className="space-y-4">

<div>

<label className="mb-1.5 block text-sm

font-semibold text-slate-700">

Room Number

</label>

<input

type="text"

name="roomNumber"

value={formData.roomNumber}

onChange={handleChange}

placeholder="Example: 101"

required

className="w-full rounded-xl border

border-slate-300 bg-slate-50 px-4 py-3 outline-none

transition focus:border-blue-500 focus:bg-white

focus:ring-4 focus:ring-blue-100"

/>

</div>

<div>

<label className="mb-1.5 block text-sm

font-semibold text-slate-700">

Room Type

</label>

<select

name="roomType"

value={formData.roomType}

onChange={handleChange}

required

className="w-full rounded-xl border

border-slate-300 bg-slate-50 px-4 py-3 outline-none

transition focus:border-blue-500 focus:bg-white

focus:ring-4 focus:ring-blue-100">

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

Dormitory </option>

<option value="Shared">

Shared

</option>

</select>

</div>

<div className="grid grid-cols-1 gap-4

sm:grid-cols-2">

<div>

<label className="mb-1.5 block text-sm

font-semibold text-slate-700">

Capacity </label>

<input

type="number" name="capacity"

value={formData.capacity}

onChange={handleChange}

placeholder="Capacity"

min="1"

required

className="w-full rounded-xl border

border-slate-300 bg-slate-50 px-4 py-3 outline-none

transition focus:border-blue-500 focus:bg-white

focus:ring-4 focus:ring-blue-100"

/>

</div>

<div>

<label className="mb-1.5 block text-sm

font-semibold text-slate-700">

Occupied

</label>

<input

type="number"

name="occupied"

value={formData.occupied}

readOnly

className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3

text-slate-500"

/>

</div>

</div>
<p className="-mt-2 text-xs text-slate-400">

Occupied beds update automatically when residents are allocated or checked out.

</p>

<div className="grid grid-cols-1 gap-4

sm:grid-cols-2">

<div>

<label className="mb-1.5 block text-sm

font-semibold text-slate-700">

Monthly Rent

</label>

<input

type="number"

name="rent"

value={formData.rent}

onChange={handleChange}

placeholder="₹ Monthly rent"

min="0"

className="w-full rounded-xl border

border-slate-300 bg-slate-50 px-4 py-3 outline-none

transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"

/>

</div>

<div>
  <label className="mb-1 block text-sm font-medium text-gray-700">
    Utilities Fee
  </label>

  <input
    type="number"
    name="utilitiesFee"
    value={formData.utilitiesFee}
    onChange={handleChange}
    placeholder="Enter utilities fee"
    min="0"
    step="0.01"
    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
  />
</div>

</div>

<div className="flex justify-end gap-3 pt-4">

<button

type="button"

onClick={() => {



setShowForm(false);

setEditingRoom(null);
}}

className="rounded-xl border

border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-100">

Cancel

</button>

<button

type="submit"

className="rounded-xl bg-gradient-to-r

from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-Ig transition 
hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl">

{editingRoom

? "Update Room"

: "Add Room"}

</button>

</div>

</form >

</div >

</div >

)
  }


  {
    showRoomView && selectedRoom && (

<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 
backdrop-blur-sm">

<div className="w-full max-w-md rounded-3xl

border border-white/50 bg-white p-7 shadow-2xl">

<div className="mb-6 flex items-center

justify-between">

<div>

<div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br 
from-blue-600 to-indigo-600 text-xl text-white shadow-lg">
🏠

</div>

<h2 className="text-2xl font-bold

text-slate-800"> Room Details

</h2>

<p className="mt-1 text-sm text-slate-500">

Room {selectedRoom.roomNumber}

</p>

</div>

<button

onClick={() => {
setShowRoomView(false); setSelectedRoom(null);
}}

    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xl 
    text-slate-500 hover:bg-red-100 hover:text-red-600">

</button >

</div >

<div className="space-y-3">

<div className="flex justify-between

rounded-xl bg-slate-50 px-4 py-3">

<span className="text-sm text-slate-500">

Room Number

</span>

<span className="font-bold text-slate-800"> {selectedRoom.roomNumber}

</span>

</div>

<div className="flex justify-between

rounded-xl bg-slate-50 px-4 py-3">

<span className="text-sm text-slate-500">

Room Type

</span>

<span className="font-bold text-slate-800">

{selectedRoom.roomType}

</span>

</div>



<div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">

      <span className = "text-sm text-slate-500">

        Capacity 
        </span >

          <span className="font-bold text-slate-800"> {selectedRoom.capacity}

          </span>

</div >

<div className="flex justify-between

rounded-xl bg-slate-50 px-4 ру-3">

<span className="text-sm text-slate-500">
   Occupied Beds

</span>

<span className="font-bold text-slate-800">

{selectedRoom.occupied}

</span>

</div>

<div className="flex justify-between

rounded-xl bg-green-50 px-4 py-3">

<span className="text-sm text-slate-500">
 Available Beds

</span>

<span className="font-bold

text-green-600">

{getAvailableBeds (selectedRoom)}

</span>

</div >

      <div className="flex justify-between

rounded-xl bg-slate-50 px-4 py-3">

        <span className="text-sm text-slate-500">

Monthly Rent 
</span>

<span className="font-bold text-slate-800"> 
₹{selectedRoom.rent || 0}

      </span>

</div >

      <div className="flex justify-between

rounded-xl bg-slate-50 px-4 py-3">

        <span className="text-sm text-slate-500">

          Utilities Fee

        </span>

      

<span className = "font-bold text-slate-800">

    ₹{selectedRoom.utilitiesFee || 0 }
    </span>

</div >

      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

        <span className="text-sm text-slate-500">

Status

</span>

{ selectedRoom.status === "Maintenance"? (

<span className="rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-bold

text-yellow-700">

Maintenance

</span>

): getAvailableBeds(selectedRoom) ===0?(

<span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">

          Occupied

        </span>

        ):(

        <span className="rounded-full

bg-green-100 px-3 py-1.5 text-xs font-bold

text-green-700">

Available

</span>

)}

</div>

</div>

<button

onClick={() => {

setSelectedRoom(null);

setShowRoomView(false);
        }}

className='mt-6 w-full rounded-xl

bg-slate-800 px-5 py-3 font-semibold text-white

transition hover:bg-slate-900'



>

Close

</button>

</div>

</div>

        )}

{showAllocation && selectedRoom && (

<div className="fixed inset-0 z-50 flex

          items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">

        <div className="w-full max-w-md rounded-3xl

bg-white p-7 shadow-2xl">

          <div className="mb-6 flex items-center

justify-between">

            <div>

              <h2 className="text-2xl font-bold

text-slate-800">

                Allocate Room

              </h2>

              <p className="mt-1 text-sm text-slate-500">

                Assign a resident to this room

              </p>

            </div>

            <button

              onClick={() => {setShowAllocation(false);



            setSelectedResident("");
              }}

            className="flex h-9 w-9 items-center

            justify-center rounded-full bg-slate-100 text-xl

            text-slate-500 hover:bg-red-100 hover:text-red-600">
              x

          </button>

        </div>

        <div className="mb-6 rounded-2xl border

border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">

          <p className="mb-2 text-sm text-slate-600">

            Room

            <span className="ml-2 font-bold

text-blue-600">

{selectedRoom.roomNumber}

            </span>

          </p>

          <p className="mb-2 text-sm text-slate-600">

            Type

            <span className="ml-2 font-semibold

text-slate-800"> {selectedRoom.roomType}

            </span>

          </p>

          <p className="text-sm text-slate-600">

            Available Beds

            <span className="ml-2 font-bold

text-green-600">

{getAvailableBeds(selectedRoom)}

            </span>

          </p>

        </div>

        <label className="mb-2 block text-sm

font-semibold text-slate-700">

          Select Resident

        </label>

        <select

          onChange={(e) =>

            setSelectedResident(e.target.value)

}

        value={selectedResident}

        className="mb-6 w-full rounded-xl border

        border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white

        focus:ring-4 focus:ring-blue-100">



        <option value="">

          Select resident

        </option>

        {residents

          .filter(

            (resident) =>

resident.status==="Active" &&

          !resident.roomId

          )

          .map((resident) => (

            <option

              key={resident._id} value={resident._id}
>
              {resident.firstName}{" "}

              {resident.lastName}

</option>

))}
  

</select >

<div className="flex justify-end gap-3">

<button

type="button"

onClick={() => {



setShowAllocation(false);

setSelectedResident("");
}}

className="rounded-xl border

border-slate-300 px-5 py-3 font-medium text-slate-700

transition hover:bg-slate-100"

>

Cancel

</button>

<button  type="button"
         onClick={handleAllocate}
         className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-3 font-semibold 
                    text-white shadow-lg transition hover:from-green-700 hover:to-emerald-700">

                   Allocate & Check-in

</button >

</div >

</div >

</div >

)}

</div >

);

}

export default Rooms;