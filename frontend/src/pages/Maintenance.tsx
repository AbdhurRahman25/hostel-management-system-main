import { apiFetch } from "../services/api";
import { useEffect, useState } from "react";

interface MaintenanceRequest {
  _id: string;
  title: string;
  roomNumber: string;
  category: string;
  priority: string;
  status: string;
  description: string;
}

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

function Maintenance() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [, setRooms] = useState<Room[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [editingRequest, setEditingRequest] =
    useState<MaintenanceRequest | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    roomNumber: "",
    category: "",
    priority: "Medium",
    status: "Pending",
    description: "",
  });

  // =========================
  // FETCH REQUESTS
  // =========================

  const fetchRequests = async () => {
    try {
      const response = await apiFetch(
        "/api/maintenance"
      );

      const result = await response.json();

      if (result.success) {
        setRequests(result.data);
      }
    } catch (error) {
      console.error(
        "Failed to fetch maintenance requests:",
        error
      );
    }
  };

  // =========================
  // FETCH ROOMS
  // =========================

  const fetchRooms = async () => {
    try {
      const response = await apiFetch(
        "/api/rooms"
      );

      const result = await response.json();

      if (result.success) {
        setRooms(result.data);
      }
    } catch (error) {
      console.error(
        "Failed to fetch rooms:",
        error
      );
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchRooms();
  }, []);

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setFormData({
      title: "",
      roomNumber: "",
      category: "",
      priority: "Medium",
      status: "Pending",
      description: "",
    });

    setEditingRequest(null);
    setShowForm(false);
  };

  // =========================
  // ADD / UPDATE
  // =========================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      const url = editingRequest
        ? `/api/maintenance/${editingRequest._id}`
        : "/api/maintenance";

      const response = await apiFetch(url, {
        method: editingRequest ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        alert(
          result.message ||
            "Something went wrong"
        );
        return;
      }

      if (editingRequest) {
        setRequests((prev) =>
          prev.map((request) =>
            request._id === editingRequest._id
              ? result.data
              : request
          )
        );
      } else {
        setRequests((prev) => [
          ...prev,
          result.data,
        ]);
      }

      resetForm();
    } catch (error) {
      console.error(
        "Failed to save maintenance request:",
        error
      );

      alert("Failed to connect to server");
    }
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (
    request: MaintenanceRequest
  ) => {
    setEditingRequest(request);

    setFormData({
      title: request.title,
      roomNumber: request.roomNumber,
      category: request.category,
      priority: request.priority,
      status: request.status,
      description: request.description,
    });

    setShowForm(true);
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (
    id: string
  ) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this request?"
      )
    ) {
      return;
    }

    try {
      const response = await apiFetch(
        `/api/maintenance/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        setRequests((prev) =>
          prev.filter(
            (request) => request._id !== id
          )
        );
      } else {
        alert(
          result.message ||
            "Failed to delete request"
        );
      }
    } catch (error) {
      console.error(
        "Failed to delete maintenance request:",
        error
      );

      alert("Failed to connect to server");
    }
  };

  // =========================
  // STATUS STYLE
  // =========================

  const getStatusStyle = (status: string) => {
    if (status === "Completed") {
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    }

    if (status === "In Progress") {
      return "bg-blue-50 text-blue-700 border border-blue-200";
    }

    return "bg-amber-50 text-amber-700 border border-amber-200";
  };

  // =========================
  // PRIORITY STYLE
  // =========================

  const getPriorityStyle = (
    priority: string
  ) => {
    if (priority === "High") {
      return "bg-red-50 text-red-700 border border-red-200";
    }

    if (priority === "Low") {
      return "bg-slate-50 text-slate-600 border border-slate-200";
    }

    return "bg-orange-50 text-orange-700 border border-orange-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">

      {/* =========================
          HEADER
      ========================= */}

      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="mb-2 flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-2xl text-white shadow-lg">
              🔧
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                Maintenance
              </h1>

              <p className="text-sm text-slate-500">
                Manage hostel maintenance requests
              </p>
            </div>

          </div>
        </div>

        <button
          onClick={() => {
            setEditingRequest(null);

            setFormData({
              title: "",
              roomNumber: "",
              category: "",
              priority: "Medium",
              status: "Pending",
              description: "",
            });

            setShowForm(true);
          }}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
        >
          <span className="mr-2 text-lg">
            +
          </span>
          New Request
        </button>

      </div>

      {/* =========================
          SUMMARY CARDS
      ========================= */}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Total */}
        <div className="group rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Requests
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-800">
                {requests.length}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl">
              🛠️
            </div>

          </div>

        </div>

        {/* Pending */}
        <div className="group rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Pending
              </p>

              <h2 className="mt-2 text-3xl font-bold text-amber-600">
                {
                  requests.filter(
                    (r) =>
                      r.status === "Pending"
                  ).length
                }
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-xl">
              ⏳
            </div>

          </div>

        </div>

        {/* In Progress */}
        <div className="group rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                In Progress
              </p>

              <h2 className="mt-2 text-3xl font-bold text-blue-600">
                {
                  requests.filter(
                    (r) =>
                      r.status ===
                      "In Progress"
                  ).length
                }
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl">
              ⚙️
            </div>

          </div>

        </div>

        {/* Completed */}
        <div className="group rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Completed
              </p>

              <h2 className="mt-2 text-3xl font-bold text-emerald-600">
                {
                  requests.filter(
                    (r) =>
                      r.status ===
                      "Completed"
                  ).length
                }
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-xl">
              ✓
            </div>

          </div>

        </div>

      </div>

      {/* =========================
          TABLE
      ========================= */}

      <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-xl backdrop-blur">

        <div className="border-b border-slate-100 px-6 py-5">

          <h2 className="text-xl font-bold text-slate-800">
            Maintenance Requests
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View and manage all reported issues
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-50">

              <tr>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Issue
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Room
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Category
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Priority
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

              {requests.map((request) => (

                <tr
                  key={request._id}
                  className="border-t border-slate-100 transition hover:bg-blue-50/40"
                >

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg">
                        🔧
                      </div>

                      <div>
                        <p className="font-semibold text-slate-800">
                          {request.title}
                        </p>

                        <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                          {request.description ||
                            "No description"}
                        </p>
                      </div>

                    </div>

                  </td>

                  <td className="px-6 py-5">

                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                      Room {request.roomNumber}
                    </span>

                  </td>

                  <td className="px-6 py-5">

                    <span className="text-sm font-medium text-slate-600">
                      {request.category}
                    </span>

                  </td>

                  <td className="px-6 py-5">

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getPriorityStyle(
                        request.priority
                      )}`}
                    >
                      {request.priority}
                    </span>

                  </td>

                  <td className="px-6 py-5">

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>

                  </td>

                  <td className="px-6 py-5">

                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          handleEdit(request)
                        }
                        className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            request._id
                          )
                        }
                        className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {requests.length === 0 && (

          <div className="p-16 text-center">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
              🔧
            </div>

            <h3 className="font-semibold text-slate-700">
              No maintenance requests
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Create a new request to get started.
            </p>

          </div>

        )}

      </div>

      {/* =========================
          FORM MODAL
      ========================= */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/50 bg-white p-7 shadow-2xl">

            {/* Modal Header */}

            <div className="mb-7 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl text-white shadow-lg">
                  🔧
                </div>

                <div>

                  <h2 className="text-2xl font-bold text-slate-800">
                    {editingRequest
                      ? "Edit Request"
                      : "New Maintenance Request"}
                  </h2>

                  <p className="text-sm text-slate-500">
                    Enter the maintenance details
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={resetForm}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-2xl text-slate-500 transition hover:bg-red-50 hover:text-red-600"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Issue */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Issue
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Example: AC not working"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

              </div>

              {/* Room + Category */}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Room Number
                  </label>

                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    placeholder="Example: 101"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Category
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  >
<option value="">
  Select category

</option>

<option value="Electrical">



Electrical

</option>

<option value="Plumbing">

Plumbing

</option>

<option value="Furniture">

Furniture

</option>

<option value="Cleaning">

Cleaning

</option>

<option value="Other">

Other

</option>

</select>

</div>

</div>

{/* Priority + Status */}

<div className="grid grid-cols-1 gap-5

sm:grid-cols-2">

<div>

<label className="mb-2 block text-sm

font-semibold text-slate-700">

Priority

</label>

<select

name="priority"

value={formData.priority} onChange={handleChange}

className="w-full rounded-xl border

border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus: border-blue-500 focus:bg-white

focus:ring-4 focus:ring-blue-100">

<option value="Low">

Low

</option>

<option value="Medium">

Medium

</option>

<option value="High">


High

</option>

</select>

</div>

<div>

<label className="mb-2 block text-sm

font-semibold text-slate-700">

Status

</label>

<select

name="status"

value={formData.status} onChange={handleChange}

className="w-full rounded-xl border

border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white

focus:ring-4 focus:ring-blue-100"

>

<option value="Pending">

Pending

</option>

<option value="In Progress">

In Progress

</option>

<option value="Completed">

Completed

</option>

</select>

</div>

</div>

{/* Description */}

<div>

<label className="mb-2 block text-sm

font-semibold text-slate-700">

Description

</label>

<textarea

name="description"

value={formData.description}

onChange={handleChange}

placeholder="Describe the issue..."

rows={4}

className="w-full resize-none rounded-xl

border border-slate-200 bg-slate-50 px-4 py-3.5

outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />

</div>

{/* Buttons */}

<div className="flex justify-end gap-3

border-t border-slate-100 pt-5">

<button

type="button"

onClick={resetForm}

className="rounded-xl border

border-slate-200 bg-white px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-100"

>

Cancel

</button>

<button

type="submit"

className="rounded-xl bg-gradient-to-r

from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5

hover:shadow-xl"

>

{editingRequest

? "Update Request"

: "Create Request"}

</button>

</div>

</form>

</div>

</div>

)}

</div>

);

}

export default Maintenance;