import { apiFetch } from "../services/api";
import { useEffect, useState } from "react";

interface Resident {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  preferredRoomType?: string;
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
  preferredRoomType: string;
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
    preferredRoomType: "",
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
        "/api/residents"
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
      console.error("Failed to fetch residents:", error);
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
  // ADD FORM
  // =========================

  const openAddForm = () => {
    setEditingResident(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  // =========================
  // EDIT FORM
  // =========================

  const openEditForm = (resident: Resident) => {
    setEditingResident(resident);

    setFormData({
      firstName: resident.firstName || "",
      lastName: resident.lastName || "",
      email: resident.email || "",
      phone: resident.phone || "",
      gender: resident.gender || "",
      preferredRoomType: resident.preferredRoomType || "",
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
      const isEditing = editingResident !== null;

      const url = isEditing
        ? `https://hostel-management-system-main.onrender.com/api/residents/${editingResident._id}`
        : "https://hostel-management-system-main.onrender.com/api/residents";

      const method = isEditing ? "PUT" : "POST";

      const body = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        preferredRoomType:formData.preferredRoomType,

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
      console.error("Save resident error:", error);
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

    if (
      !window.confirm(
        "Are you sure you want to delete this resident?"
      )
    ) {
      return;
    }

    try {
      const response = await apiFetch(
        `http://hostel-management-system-main.onrender.com/api/residents/${residentId}`,
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
      console.error("Delete resident error:", error);
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

    if (
      !window.confirm(
        "Are you sure you want to check out this resident?"
      )
    ) {
      return;
    }

    try {
      const response = await apiFetch(
        `https://hostel-management-system-main.onrender.com/api/residents/${residentId}/checkout`,
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
      console.error("Checkout error:", error);
      alert("Failed to connect to server");
    }
  };

  // =========================
  // COUNTS
  // =========================

  const activeCount = residents.filter(
    (r) => r.status === "Active"
  ).length;

  const assignedCount = residents.filter(
    (r) => r.roomId
  ).length;

  const unassignedCount = residents.filter(
    (r) => !r.roomId
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">

      {/* ================= HEADER ================= */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-2xl text-white shadow-lg">
              👥
            </div>

            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-800">
                Residents
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage hostel resident information
              </p>
            </div>

          </div>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
        >
          + Add Resident
        </button>

      </div>

      {/* ================= STAT CARDS ================= */}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-2xl border border-white bg-white/80 p-5 shadow-lg backdrop-blur">
          <p className="text-sm font-medium text-gray-500">
            Total Residents
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-gray-800">
            {residents.length}
          </h2>

          <p className="mt-1 text-xs text-gray-400">
            Registered residents
          </p>
        </div>

        <div className="rounded-2xl border border-green-100 bg-white/80 p-5 shadow-lg backdrop-blur">
          <p className="text-sm font-medium text-gray-500">
            Active Residents
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-green-600">
            {activeCount}
          </h2>

          <p className="mt-1 text-xs text-green-500">
            Currently active
          </p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white/80 p-5 shadow-lg backdrop-blur">
          <p className="text-sm font-medium text-gray-500">
            Room Assigned
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-blue-600">
            {assignedCount}
          </h2>

          <p className="mt-1 text-xs text-blue-500">
            Residents with rooms
          </p>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-white/80 p-5 shadow-lg backdrop-blur">
          <p className="text-sm font-medium text-gray-500">
            Not Assigned
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-orange-500">
            {unassignedCount}
          </h2>

          <p className="mt-1 text-xs text-orange-500">
            Waiting for allocation
          </p>
        </div>

      </div>

      {/* ================= TABLE ================= */}

      <div className="overflow-hidden rounded-2xl border border-white bg-white/90 shadow-xl backdrop-blur">

        <div className="border-b border-gray-100 px-6 py-5">

          <h2 className="text-xl font-bold text-gray-800">
            Resident List
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            View and manage all registered residents
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="bg-gray-50/80 text-left">

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Resident
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Contact
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Room
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {residents.map((resident) => (

                <tr
                  key={resident._id}
                  className="border-t border-gray-100 transition hover:bg-blue-50/40"
                >

                  {/* Resident */}

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 font-bold text-white shadow">
                        {resident.firstName
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <p className="font-semibold text-gray-800">
                          {resident.firstName}{" "}
                          {resident.lastName}
                        </p>

                        <p className="text-xs text-gray-400">
                          {resident.gender}
                        </p>
                      </div>

                    </div>

                  </td>

                  {/* Contact */}

                  <td className="px-6 py-5">

                    <p className="text-sm font-medium text-gray-700">
                      {resident.email}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      📞 {resident.phone}
                    </p>

                  </td>

                  {/* Room */}

                  <td className="px-6 py-5">

                    {resident.roomNumber ? (

                      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                        Room {resident.roomNumber}
                      </span>

                    ) : (

                      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-500">
                        Not Assigned
                      </span>

                    )}

                  </td>

                  {/* Status */}

                  <td className="px-6 py-5">

                    {resident.status === "Active" ? (

                      <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">

                        <span className="h-2 w-2 rounded-full bg-green-500" />

                        Active

                      </span>

                    ) : (

                      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                        {resident.status || "Unknown"}
                      </span>

                    )}

                  </td>

                  {/* Actions */}

                  <td className="px-6 py-5">

                    <div className="flex flex-wrap gap-2">

                      <button
                        onClick={() =>
                          openEditForm(resident)
                        }
                        className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                      >
                        Edit
                      </button>

                      {resident.status === "Active" &&
                        resident.roomId && (

                          <button
                            onClick={() =>
                              handleCheckout(
                                resident._id
                              )
                            }
                            className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-100"
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

        {/* Empty */}

        {!loading &&
          residents.length === 0 && (

            <div className="p-16 text-center">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">
                👥
              </div>

              <h3 className="font-semibold text-gray-700">
                No residents found
              </h3>

              <p className="mt-1 text-sm text-gray-400">
                Add your first resident to get started.
              </p>

            </div>

          )}

        {/* Loading */}

        {loading && (

          <div className="p-16 text-center">

            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

            <p className="text-sm text-gray-500">
              Loading residents...
            </p>

          </div>

        )}

      </div>

      {/* ================= ADD / EDIT MODAL ================= */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                  {editingResident ? "✏️" : "👤"}
                </div>

                <div>

                  <h2 className="text-xl font-bold text-gray-800">
                    {editingResident
                      ? "Edit Resident"
                      : "Add Resident"}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Enter resident information
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingResident(null);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
              >
                ×
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6"
            >

              {/* Personal Information */}

              <div>

                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500">
                  <span>👤</span>
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      First Name
                    </label>

                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"

                      required

                      className="w-full rounded-xl border

border-gray-300 px-4 py-3 outline-none transition

focus:border-blue-500 focus:ring-4

focus:ring-blue-100"

                    />

                  </div>

                  <div>

                    <label className="mb-1.5 block text-sm

font-semibold text-gray-700">

                      Last Name

                    </label>

                    <input

                      type="text"

                      name="lastName"

                      value={formData.lastName}

                      onChange={handleChange}

                      placeholder="Enter last name"

                      className="w-full rounded-xl border

required

border-gray-300 px-4 py-3 outline-none transition

focus:ring-blue-100"

                    />

                  </div>

                  <div>



                    <label className="mb-1.5 block text-sm

font-semibold text-gray-700">

                      Email

                    </label>

                    <input

                      type="email"

                      name="email"

                      value={formData.email}

                      onChange={handleChange}

                      placeholder="example@gmail.com"

                      required

                      className="w-full rounded-xl border

border-gray-300 px-4 py-3 outline-none transition

focus:border-blue-500 focus:ring-4

focus:ring-blue-100"

                    />

                  </div>

                  <div>

                    <label className="mb-1.5 block text-sm

font-semibold text-gray-700">

                      Phone

                    </label>

                    <input type="text"

                      name="phone"

                      value={formData.phone}

                      onChange={handleChange}

                      placeholder="98765 43210"

                      className="w-full rounded-xl border

required

border-gray-300 px-4 py-3 outline-none transition

focus:border-blue-500 focus:ring-4

focus:ring-blue-100"

                    />

                  </div>

                  <div className="md:col-span-2">

                    <label className="mb-1.5 block text-sm

font-semibold text-gray-700">

                      Gender

                    </label>

                    <select

                      name="gender"

                      value={formData.gender}

                      onChange={handleChange}

                      required

                      className="w-full rounded-xl border

border-gray-300 bg-white px-4 py-3 outline-none

transition focus:border-blue-500 focus:ring-4

focus:ring-blue-100"

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

                </div>

              </div>

              {/* Preferred Room Type */}

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Preferred Room Type
                </label>

                <select
                  name="preferredRoomType"
                  value={formData.preferredRoomType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">No Preference</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Triple">Triple</option>
                  <option value="Dormitory">Dormitory</option>
                  <option value="Shared">Shared</option>
                </select>
              </div>

              {/* Emergency Contact */}

              <div className="border-t pt-6">

                <h3 className="mb-4 flex items-center

gap-2 text-sm font-bold uppercase tracking-wider

text-gray-500">

                  <span> </span>

                  Emergency Contact

                </h3>

                <div className="grid grid-cols-1 gap-4

md:grid-cols-3">

                  <div>

                    <label className="mb-1.5 block text-sm

font-semibold text-gray-700">

                      Name

                    </label>

                    <input

                      type="text"

                      name="emergencyName"

                      value={formData.emergencyName}


                      onChange={handleChange}

                      placeholder="Contact name"

                      required className="w-full rounded-xl border

border-gray-300 px-4 py-3 outline-none transition

focus:border-blue-500 focus:ring-4

focus:ring-blue-100"

                    />

                  </div>

                  <div>

                    <label className="mb-1.5 block text-sm

font-semibold text-gray-700">

                      Phone

                    </label>

                    <input type="text"

                      name="emergencyPhone"

                      value={formData.emergencyPhone

                      }



                      onChange={handleChange}

                      placeholder="Phone number"

                      required

                      className="w-full rounded-xl border

border-gray-300 px-4 py-3 outline-none transition

focus:border-blue-500 focus:ring-4

focus:ring-blue-100"

                    />

                  </div>

                  <div>

                    <label className="mb-1.5 block text-sm

font-semibold text-gray-700">

                      Relationship

                    </label>

                    <input

                      type="text"

                      name="relationship"

                      value={formData.relationship

                      } onChange={handleChange}



                      placeholder="Father / Mother"

                      required

                      className="w-full rounded-xl border

border-gray-300 px-4 py-3 outline-none transition

focus:border-blue-500 focus:ring-4

focus:ring-blue-100"

                    />

                  </div>

                </div>

              </div>

              {/* Buttons */}

              <div className="flex flex-col-reverse gap-3

border-t pt-5 sm:flex-row sm.justify-end">

                <button

                  type="button"

                  onClick={() => {



                    setShowForm(false);

                    setEditingResident(null);
                  }}

                  className="rounded-xl border

border-gray-300 px-6 py-3 font-semibold

text-gray-600 transition hover:bg-gray-50">

                  Cancel

                </button>

                <button

                  type="submit"

                  className="rounded-xl bg-gradient-to-r

from-blue-600 to-indigo-600 px-7 py-3 font-semibold

text-white shadow-Ig transition hover:-translate-y-0.5

hover:shadow-xl">

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