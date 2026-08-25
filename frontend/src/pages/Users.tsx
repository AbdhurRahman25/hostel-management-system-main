import { apiFetch } from "../services/api";
import { useState, useEffect } from "react";

interface User {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  password?: string;
}

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const adminCount = users.filter(
    (user) => user.role === "Admin"
  ).length;
  const managerCount = users.filter(
    (user) => user.role === "Manager"
  ).length;


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiFetch(
          "/api/users"
        );

        const result = await response.json();

        if (result.success) {
          setUsers(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  const [showForm, setShowForm] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Staff",
    status: "Active",
    password: "",
  });

 const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;

  if (name === "phone") {
    // Numbers only
    let phone = value.replace(/\D/g, "");

    // Maximum 10 digits
    phone = phone.slice(0, 10);

    // Format: 5 digits + space + 5 digits
    if (phone.length > 5) {
      phone = phone.slice(0, 5) + " " + phone.slice(5);
    }

    setFormData({
      ...formData,
      phone,
    });

    return;
  }

  setFormData({
    ...formData,
    [name]: value,
  });
};

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "Staff",
      status: "Active",
      password: "",
    });

    setEditingUser(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingUser
        ? `http://localhost:5000/api/users/${editingUser._id}`
        : "http://localhost:5000/api/users";

      const response = await apiFetch(url, {
        method: editingUser ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({...formData,phone:formData.phone.replace(/\s/g,""),}),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed");
      }

      if (editingUser) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === editingUser._id ? result.data : user
          )
        );
      } else {
        setUsers((prevUsers) => [
          ...prevUsers,
          result.data,
        ]);
      }

      resetForm();

    } catch (error) {
      console.error("User operation failed:", error);
      alert("Failed to save user");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);

    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      password: "",
    });

    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await apiFetch(
        `http://localhost:5000/api/users/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Delete failed");
      }

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== id)
      );

    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user");
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">

    {/* ================= HEADER ================= */}
    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

      <div>
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl text-white shadow-lg shadow-blue-200">
            👥
          </div>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
              Users
            </h1>

            <p className="text-sm text-slate-500">
              Manage hostel staff and system users
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          setEditingUser(null);

          setFormData({
            name: "",
            email: "",
            phone: "",
            role: "Staff",
            status: "Active",
            password: "",
          });

          setShowForm(true);
        }}
        className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
      >
        <span className="text-xl transition-transform group-hover:rotate-90">
          +
        </span>
        Add User
      </button>

    </div>


    {/* ================= STATS ================= */}
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

      {/* Total */}
      <div className="group rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm font-medium text-slate-500">
              Total Users
            </p>

            <h2 className="mt-2 text-3xl font-extrabold text-slate-800">
              {users.length}
            </h2>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl">
            👥
          </div>

        </div>

      </div>


      {/* Active */}
      <div className="group rounded-2xl border border-green-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm font-medium text-slate-500">
              Active Users
            </p>

            <h2 className="mt-2 text-3xl font-extrabold text-green-600">
              {
                users.filter(
                  (user) => user.status === "Active"
                ).length
              }
            </h2>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-xl">
            ✓
          </div>

        </div>

      </div>


      {/* Inactive */}
      <div className="group rounded-2xl border border-red-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm font-medium text-slate-500">
              Inactive Users
            </p>

            <h2 className="mt-2 text-3xl font-extrabold text-red-600">
              {
                users.filter(
                  (user) => user.status !== "Active"
                ).length
              }
            </h2>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-xl">
            !
          </div>

        </div>

      </div>

    </div>


    {/* ================= TABLE ================= */}
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

      {/* Table Header */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-5">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-lg font-bold text-slate-800">
              System Users
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              All registered hostel staff and administrators
            </p>
          </div>

          <div className="rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
            {users.length} Users
          </div>

        </div>

      </div>


      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                User
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Email
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Phone
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Role
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Status
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Actions
              </th>

            </tr>
          </thead>


          <tbody className="divide-y divide-slate-100">

            {users.map((user) => (

              <tr
                key={user._id}
                className="group transition-colors duration-200 hover:bg-blue-50/40"
              >

                {/* User */}
                <td className="px-6 py-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 font-bold uppercase text-white shadow-md">
                      {user.name?.charAt(0)}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        {user.name}
                      </p>

                      <p className="text-xs text-slate-400">
                        System User
                      </p>
                    </div>

                  </div>

                </td>


                {/* Email */}
                <td className="px-6 py-5">

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-blue-500">
                      ✉️
                    </span>

                    {user.email}
                  </div>

                </td>


                {/* Phone */}
                <td className="px-6 py-5">

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-green-500">
                      ☎️
                    </span>

                    {user.phone}
                  </div>

                </td>


                {/* Role */}
                <td className="px-6 py-5">

                  <span
                    className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-bold ${
                      user.role === "Admin"
                        ? "bg-purple-100 text-purple-700"
                        : user.role === "Manager"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {user.role}
                  </span>

                </td>


                {/* Status */}
                <td className="px-6 py-5">

                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >

                    <span
                      className={`h-2 w-2 rounded-full ${
                        user.status === "Active"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />

                    {user.status}

                  </span>

                </td>


                {/* Actions */}
                <td className="px-6 py-5">

                  <div className="flex items-center gap-2">

                    <button
                      onClick={() => handleEdit(user)}
                      className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 hover:text-blue-800"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        user._id &&
                        handleDelete(user._id)
                      }
                      className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 hover:text-red-800"
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


      {/* Empty State */}
      {users.length === 0 && (

        <div className="flex flex-col items-center justify-center px-6 py-16">

          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
            👥
          </div>

          <h3 className="text-lg font-bold text-slate-700">
            No users found
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Add your first system user to get started.
          </p>

        </div>

      )}

    </div>


    {/* ================= MODAL ================= */}
    {showForm && (

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

        <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">

          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 text-white">

            <div className="flex items-center justify-between">

              <div>

                <div className="mb-1 flex items-center gap-2">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg">
                    👤
                  </div>

                  <h2 className="text-2xl font-bold">
                    {editingUser
                      ? "Edit User"
                      : "Add User"}
                  </h2>

                </div>

                <p className="text-sm text-blue-100">
                  {editingUser
                    ? "Update user account information"
                    : "Create a new system user"}
                </p>

              </div>

              <button
                type="button"
                onClick={resetForm}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-2xl transition hover:bg-white/20"
              >
                ×
              </button>

            </div>

          </div>


          {/* Modal Body */}
          <div className="max-h-[75vh] overflow-y-auto p-6">

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Name */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    👤
                  </span>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                </div>

              </div>


              {/* Email */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    ✉️
                  </span>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@gmail.com"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                </div>

              </div>


              {/* Phone */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Phone Number
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    ☎️
                  </span>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="98765 43210"
                    required
                    maxLength={11}
                    inputMode="numeric"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                </div>

              </div>


              {/* Password */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password{" "}
                  {editingUser && (
                    <span className="font-normal text-slate-400">
                      (leave blank to keep current)
                    </span>
                  )}
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    🔒
                  </span>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingUser}
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                </div>

              </div>


              {/* Role + Status */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Role
                  </label>

                  <select
  name="role"
  value={formData.role}
  onChange={handleChange}
  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
>

  {/* Admin */}
  {(adminCount < 1 ||
    editingUser?.role === "Admin") && (
    <option value="Admin">
      Admin
    </option>
  )}

  {/* Manager */}
  {(managerCount < 2 ||
    editingUser?.role === "Manager") && (
    <option value="Manager">
      Manager
    </option>
  )}

  {/* Staff - Unlimited */}
  <option value="Staff">
    Staff
  </option>

  {/* Resident - Unlimited */}
  <option value="Resident">
    Resident
  </option>

</select>

                </div>


                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  >

                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>

                  </select>

                </div>

              </div>


              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  {editingUser
                    ? "Update User"
                    : "Add User"}
                </button>

              </div>

            </form>

          </div>

        </div>

      </div>

    )}

  </div>
);
}

export default Users;