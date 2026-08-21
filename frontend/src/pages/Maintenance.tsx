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

  const [rooms, setRooms] = useState<Room[]>([]);

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

  // GET maintenance requests
  const fetchRequests = async () => {
    try {
      const response = await apiFetch(
        "http://localhost:5000/api/maintenance"
      );

      const result = await response.json();

      if (result.success) {
        setRequests(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch maintenance requests:", error);
    }
  };

  // GET rooms
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

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

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

  // ADD / UPDATE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingRequest
        ? `http://localhost:5000/api/maintenance/${editingRequest._id}`
        : "http://localhost:5000/api/maintenance";

      const response = await apiFetch(url, {
        method: editingRequest ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.message || "Something went wrong");
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
        setRequests((prev) => [...prev, result.data]);
      }

      resetForm();
    } catch (error) {
      console.error("Failed to save maintenance request:", error);
    }
  };

  // EDIT
  const handleEdit = (request: MaintenanceRequest) => {
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

  // DELETE
  const handleDelete = async (id: string) => {
    try {
      const response = await apiFetch(
        `http://localhost:5000/api/maintenance/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        setRequests((prev) =>
          prev.filter((request) => request._id !== id)
        );
      }
    } catch (error) {
      console.error(
        "Failed to delete maintenance request:",
        error
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Maintenance
          </h1>

          <p className="mt-1 text-gray-500">
            Manage maintenance requests
          </p>
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
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          + New Request
        </button>

      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50">

              <tr>
                <th className="px-6 py-4 text-left">
                  Issue
                </th>

                <th className="px-6 py-4 text-left">
                  Room
                </th>

                <th className="px-6 py-4 text-left">
                  Category
                </th>

                <th className="px-6 py-4 text-left">
                  Priority
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

              {requests.map((request) => (
                <tr
                  key={request._id}
                  className="border-t"
                >

                  <td className="px-6 py-4 font-medium">
                    {request.title}
                  </td>

                  <td className="px-6 py-4">
                    {request.roomNumber}
                  </td>

                  <td className="px-6 py-4">
                    {request.category}
                  </td>

                  <td className="px-6 py-4">
                    {request.priority}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-sm ${
                        request.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : request.status === "In Progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {request.status}
                    </span>

                  </td>

                  <td className="px-6 py-4">

                    <button
                      onClick={() => handleEdit(request)}
                      className="mr-3 text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(request._id)
                      }
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

        {requests.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No maintenance requests found.
          </div>
        )}

      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold text-gray-800">
                {editingRequest
                  ? "Edit Request"
                  : "New Maintenance Request"}
              </h2>

              <button
                type="button"
                onClick={resetForm}
                className="text-2xl text-gray-500 hover:text-gray-800"
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

                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Issue
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Example: AC not working"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              {/* Room + Category */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Room Number
                  </label>

                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    placeholder="Example: 101"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />

                </div>

                <div>

                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Category
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  >

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

                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
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

                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the issue..."
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4">

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
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