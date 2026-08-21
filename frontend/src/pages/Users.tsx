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
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiFetch(
          "http://localhost:5000/api/users"
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
        body: JSON.stringify(formData),
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
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Users
          </h1>

          <p className="mt-1 text-gray-500">
            Manage hostel staff and system users
          </p>
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
            });

            setShowForm(true);
          }}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          + Add User
        </button>

      </div>

      {/* Users Table */}
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
                  Role
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

              {users.map((user) => (

                <tr
                  key={user._id}
                  className="border-t"
                >

                  <td className="px-6 py-4 font-medium">
                    {user.name}
                  </td>

                  <td className="px-6 py-4">
                    {user.email}
                  </td>

                  <td className="px-6 py-4">
                    {user.phone}
                  </td>

                  <td className="px-6 py-4">
                    {user.role}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-sm ${user.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {user.status}
                    </span>

                  </td>

                  <td className="px-6 py-4">

                    <button
                      onClick={() => handleEdit(user)}
                      className="mr-3 text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => user._id && handleDelete(user._id)}
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

        {users.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No users found.
          </div>
        )}

      </div>

      {/* Add / Edit User Modal */}
      {showForm && (

        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold text-gray-800">
                {editingUser ? "Edit User" : "Add User"}
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

              {/* Name */}
              <div>

                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              {/* Email */}
              <div>

                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              {/* Phone */}
              <div>

                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Phone
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              {/* Password */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Password {editingUser && "(leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!editingUser}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* Role */}
              <div>

                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Role
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                >

                  <option value="Admin">
                    Admin
                  </option>

                  <option value="Manager">
                    Manager
                  </option>

                  <option value="Staff">
                    Staff
                  </option>

                </select>

              </div>

              {/* Status */}
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

                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>

                </select>

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
                  {editingUser ? "Update User" : "Add User"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Users;