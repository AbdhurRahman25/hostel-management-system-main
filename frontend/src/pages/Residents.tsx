import { apiFetch } from "../services/api";
import { useEffect, useState } from "react";

interface Resident {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  status: string;
  roomId?: string | null;
  roomNumber?: string | null;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface ResidentForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  emergencyName: string;
  emergencyPhone: string;
  relationship: string;
}

function Residents() {
  const [residents, setResidents] = useState<Resident[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingResident, setEditingResident] =
    useState<Resident | null>(null);

  const [loading, setLoading] = useState(false);

  const emptyForm: ResidentForm = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    emergencyName: "",
    emergencyPhone: "",
    relationship: "",
  };

  const [formData, setFormData] =
    useState<ResidentForm>(emptyForm);

  // =========================
  // FETCH RESIDENTS
  // =========================

  const fetchResidents = async () => {
    try {
      setLoading(true);

      const response = await apiFetch(
        "http://localhost:5000/api/residents"
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(
          result.message ||
            result.error ||
            "Failed to fetch residents"
        );
        return;
      }

      setResidents(result.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch residents:",
        error
      );

      alert("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // OPEN ADD FORM
  // =========================

  const openAddForm = () => {
    setEditingResident(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  // =========================
  // OPEN EDIT FORM
  // =========================

  const openEditForm = (resident: Resident) => {
    setEditingResident(resident);

    setFormData({
      firstName: resident.firstName || "",
      lastName: resident.lastName || "",
      email: resident.email || "",
      phone: resident.phone || "",
      gender: resident.gender || "",
      emergencyName:
        resident.emergencyContact?.name || "",
      emergencyPhone:
        resident.emergencyContact?.phone || "",
      relationship:
        resident.emergencyContact?.relationship || "",
    });

    setShowForm(true);
  };

  // =========================
  // ADD / UPDATE
  // =========================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      const isEditing =
        editingResident !== null;

      const url = isEditing
        ? `http://localhost:5000/api/residents/${editingResident._id}`
        : "http://localhost:5000/api/residents";

      const method = isEditing ? "PUT" : "POST";

      const body = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,

        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relationship: formData.relationship,
        },

        status: isEditing
          ? editingResident.status
          : "Active",

        roomId: isEditing
          ? editingResident.roomId || null
          : null,

        roomNumber: isEditing
          ? editingResident.roomNumber || null
          : null,

        checkInDate: isEditing
          ? editingResident.checkInDate || null
          : null,

        checkOutDate: isEditing
          ? editingResident.checkOutDate || null
          : null,
      };

      const response = await apiFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(
          result.message ||
            result.error ||
            "Failed to save resident"
        );
        return;
      }

      alert(
        isEditing
          ? "Resident updated successfully!"
          : "Resident added successfully!"
      );

      setShowForm(false);
      setEditingResident(null);
      setFormData(emptyForm);

      await fetchResidents();
    } catch (error) {
      console.error(
        "Save resident error:",
        error
      );

      alert("Failed to connect to server");
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (
    residentId: string
  ) => {
    if (!residentId) {
      alert("Resident ID not found");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this resident?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await apiFetch(
        `http://localhost:5000/api/residents/${residentId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(
          result.message ||
            result.error ||
            "Failed to delete resident"
        );
        return;
      }

      alert("Resident deleted successfully!");

      await fetchResidents();
    } catch (error) {
      console.error(
        "Delete resident error:",
        error
      );

      alert("Failed to connect to server");
    }
  };

  // =========================
  // CHECKOUT
  // =========================

  const handleCheckout = async (
    residentId: string
  ) => {
    if (!residentId) {
      alert("Resident ID not found");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to check out this resident?"
    );

    if (!confirmed) {
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
            result.error ||
            "Checkout failed"
        );
        return;
      }

      alert(
        "Resident checked out successfully!"
      );

      await fetchResidents();
    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      alert("Failed to connect to server");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Residents
          </h1>

          <p className="mt-1 text-gray-500">
            Manage hostel resident information
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          + Add Resident
        </button>

      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl bg-white shadow">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-6 py-4 text-left">
                  Name
                </th>

                <th className="px-6 py-4 text-left">
                  Email
                </th>

                <th className="px-6 py-4 text-left">
                  Phone
                </th>

                <th className="px-6 py-4 text-left">
                  Room
                </th>

                <th className="px-6 py-4 text-left">
                  Status
                </th>

                <th className="px-6 py-4 text-left">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {residents.map((resident) => (

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
                    {resident.phone}
                  </td>

                  <td className="px-6 py-4">

                    {resident.roomNumber
                      ? `Room ${resident.roomNumber}`
                      : "Not Assigned"}

                  </td>

                  <td className="px-6 py-4">

                    {resident.status ===
                    "Active" ? (

                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                        Active
                      </span>

                    ) : (

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                        {resident.status ||
                          "Unknown"}
                      </span>

                    )}

                  </td>

                  <td className="px-6 py-4">

                    <button
                      onClick={() =>
                        openEditForm(resident)
                      }
                      className="mr-3 font-medium text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>

                    {resident.status ===
                      "Active" &&
                      resident.roomId && (

                        <button
                          onClick={() =>
                            handleCheckout(
                              resident._id
                            )
                          }
                          className="mr-3 font-medium text-orange-600 hover:text-orange-800"
                        >
                          Check-out
                        </button>

                      )}

                    <button
                      onClick={() =>
                        handleDelete(
                          resident._id
                        )
                      }
                      className="font-medium text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {!loading &&
          residents.length === 0 && (

            <div className="p-10 text-center text-gray-500">
              No residents found.
            </div>

          )}

        {loading && (

          <div className="p-10 text-center text-gray-500">
            Loading residents...
          </div>

        )}

      </div>

      {/* ADD / EDIT MODAL */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-bold text-gray-800">

                  {editingResident
                    ? "Edit Resident"
                    : "Add Resident"}

                </h2>

                <p className="text-gray-500">
                  Enter resident information
                </p>

              </div>

              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingResident(null);
                }}
                className="text-2xl text-gray-500 hover:text-gray-800"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  required
                  className="rounded-lg border px-4 py-3"
                />

                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  required
                  className="rounded-lg border px-4 py-3"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="rounded-lg border px-4 py-3"
                />

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  required
                  className="rounded-lg border px-4 py-3"
                />

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="rounded-lg border px-4 py-3"
                >

                  <option value="">
                    Select Gender
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

              <div className="border-t pt-4">

                <h3 className="mb-3 text-lg font-semibold">
                  Emergency Contact
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                  <input
                    type="text"
                    name="emergencyName"
                    value={
                      formData.emergencyName
                    }
                    onChange={handleChange}
                    placeholder="Name"
                    required
                    className="rounded-lg border px-4 py-3"
                  />

                  <input
                    type="text"
                    name="emergencyPhone"
                    value={
                      formData.emergencyPhone
                    }
                    onChange={handleChange}
                    placeholder="Phone"
                    required
                    className="rounded-lg border px-4 py-3"
                  />

                  <input
                    type="text"
                    name="relationship"
                    value={
                      formData.relationship
                    }
                    onChange={handleChange}
                    placeholder="Relationship"
                    required
                    className="rounded-lg border px-4 py-3"
                  />

                </div>

              </div>

              <div className="flex justify-end gap-3 pt-4">

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingResident(null);
                  }}
                  className="rounded-lg border px-5 py-3"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
                >
                  {editingResident
                    ? "Update Resident"
                    : "Add Resident"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Residents;