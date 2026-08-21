import { useState } from "react";

interface ResidentFormProps {
  onClose: () => void;
  onAddResident: (residentData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender: string;
    emergencyName: string;
    emergencyPhone: string;
    relationship: string;
  }) => void;

  initialData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender: string;
    emergencyName: string;
    emergencyPhone: string;
    relationship: string;
  };
}


function ResidentForm({ onClose, onAddResident, initialData }: ResidentFormProps) {

 const [formData, setFormData] = useState({
  firstName: initialData?.firstName || "",
  lastName: initialData?.lastName || "",
  email: initialData?.email || "",
  phone: initialData?.phone || "",
  gender: initialData?.gender || "",
  emergencyName: initialData?.emergencyName || "",
  emergencyPhone: initialData?.emergencyPhone || "",
  relationship: initialData?.relationship || "",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onAddResident(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? "Edit Resident" : "Add Resident"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-800"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                First Name
              </label>

              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Last Name
              </label>

              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

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
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

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
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

          </div>

          {/* Gender */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Gender
            </label>

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-800">
              Emergency Contact
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

              <input
                type="text"
                name="emergencyName"
                value={formData.emergencyName}
                onChange={handleChange}
                placeholder="Name"
                className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              <input
                type="tel"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                placeholder="Phone"
                className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              <input
                type="text"
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                placeholder="Relationship"
                className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />

            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              {initialData ? "Update Resident" : "Add Resident"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default ResidentForm;