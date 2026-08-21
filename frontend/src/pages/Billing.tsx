import { apiFetch } from "../services/api";
import { useEffect, useState } from "react";

interface Bill {
  _id: string;
  residentName: string;
  roomNumber: string;
  rent: number;
  otherCharges: number;
  status: string;
}

function Billing() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const [formData, setFormData] = useState({
    residentName: "",
    roomNumber: "",
    rent: "",
    otherCharges: "0",
    status: "Pending",
  });

  // GET bills
  const fetchBills = async () => {
    try {
      const response = await apiFetch("/api/billing");
      const result = await response.json();

      if (result.success) {
        setBills(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch bills:", error);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

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
      residentName: "",
      roomNumber: "",
      rent: "",
      otherCharges: "0",
      status: "Pending",
    });

    setEditingBill(null);
    setShowForm(false);
  };

  // ADD / UPDATE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const billData = {
      residentName: formData.residentName,
      roomNumber: formData.roomNumber,
      rent: Number(formData.rent),
      otherCharges: Number(formData.otherCharges),
      status: formData.status,
    };

    try {
      let response;

      if (editingBill) {
        response = await apiFetch(
          `http://localhost:5000/api/billing/${editingBill._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(billData),
          }
        );
      } else {
        response = await apiFetch(
          "http://localhost:5000/api/billing",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(billData),
          }
        );
      }

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Failed to save bill");
        return;
      }

      alert(
        editingBill
          ? "Bill updated successfully"
          : "Bill added successfully"
      );

      await fetchBills();

      resetForm();
    } catch (error) {
      console.error("Failed to save bill:", error);
      alert("Failed to save bill");
    }
  };

  // EDIT
  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);

    setFormData({
      residentName: bill.residentName,
      roomNumber: bill.roomNumber,
      rent: String(bill.rent),
      otherCharges: String(bill.otherCharges),
      status: bill.status,
    });

    setShowForm(true);
  };

  // DELETE
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this bill?"
    );

    if (!confirmDelete) return;

    try {
      const response = await apiFetch(
        `http://localhost:5000/api/billing/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Failed to delete bill");
        return;
      }

      await fetchBills();
    } catch (error) {
      console.error("Failed to delete bill:", error);
      alert("Failed to delete bill");
    }
  };

  const payBill = async (bill: Bill) => {
    try {
      const response = await apiFetch("/api/payments/create-order", {
        method: "POST",
        body: JSON.stringify({ billId: bill._id }),
      });
      const order = await response.json();
      if (!response.ok || !order.success) throw new Error(order.message || "Payment setup failed");

      if (order.demo) {
        const verify = await apiFetch("/api/payments/verify", {
          method: "POST",
          body: JSON.stringify({ paymentRecordId: order.paymentId }),
        });
        const result = await verify.json();
        if (!result.success) throw new Error(result.message || "Payment failed");
        alert("Demo payment completed. Add Razorpay keys in backend .env for live payments.");
        await fetchBills();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const Razorpay = (window as any).Razorpay;
        const checkout = new Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "Hostel Management",
          description: `Bill for ${bill.residentName}`,
          order_id: order.orderId,
          handler: async (payment: any) => {
            const verify = await apiFetch("/api/payments/verify", {
              method: "POST",
              body: JSON.stringify({
                paymentRecordId: order.paymentId,
                razorpay_payment_id: payment.razorpay_payment_id,
                razorpay_order_id: payment.razorpay_order_id,
                razorpay_signature: payment.razorpay_signature,
              }),
            });
            const result = await verify.json();
            alert(result.message);
            if (result.success) await fetchBills();
          },
        });
        checkout.open();
      };
      document.body.appendChild(script);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Payment failed");
    }
  };

  const getTotal = (bill: Bill) => {
    return bill.rent + bill.otherCharges;
  };

  const totalAmount = bills.reduce(
    (total, bill) => total + getTotal(bill),
    0
  );

  const paidAmount = bills
    .filter((bill) => bill.status === "Paid")
    .reduce(
      (total, bill) => total + getTotal(bill),
      0
    );

  const pendingAmount = bills
    .filter((bill) => bill.status === "Pending")
    .reduce(
      (total, bill) => total + getTotal(bill),
      0
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Billing
          </h1>

          <p className="mt-1 text-gray-500">
            Manage resident bills and payments
          </p>
        </div>

        <button
          onClick={() => {
            setEditingBill(null);

            setFormData({
              residentName: "",
              roomNumber: "",
              rent: "",
              otherCharges: "0",
              status: "Pending",
            });

            setShowForm(true);
          }}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          + Add Bill
        </button>

      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            Total Billing
          </p>

          <h2 className="mt-2 text-2xl font-bold text-gray-800">
            ₹{totalAmount}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            Paid
          </p>

          <h2 className="mt-2 text-2xl font-bold text-green-600">
            ₹{paidAmount}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            Pending
          </p>

          <h2 className="mt-2 text-2xl font-bold text-red-600">
            ₹{pendingAmount}
          </h2>
        </div>

      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50">

              <tr>
                <th className="px-6 py-4 text-left">Resident</th>
                <th className="px-6 py-4 text-left">Room</th>
                <th className="px-6 py-4 text-left">Rent</th>
                <th className="px-6 py-4 text-left">Other Charges</th>
                <th className="px-6 py-4 text-left">Total</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Action</th>
              </tr>

            </thead>

            <tbody>

              {bills.map((bill) => (

                <tr key={bill._id} className="border-t">

                  <td className="px-6 py-4 font-medium">
                    {bill.residentName}
                  </td>

                  <td className="px-6 py-4">
                    {bill.roomNumber}
                  </td>

                  <td className="px-6 py-4">
                    ₹{bill.rent}
                  </td>

                  <td className="px-6 py-4">
                    ₹{bill.otherCharges}
                  </td>

                  <td className="px-6 py-4 font-semibold">
                    ₹{getTotal(bill)}
                  </td>

                  <td className="px-6 py-4">

                    {bill.status === "Paid" ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                        Paid
                      </span>
                    ) : (
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
                        Pending
                      </span>
                    )}

                  </td>

                  <td className="px-6 py-4">

                    {bill.status !== "Paid" && (
                      <button
                        onClick={() => payBill(bill)}
                        className="mr-3 font-medium text-green-600 hover:text-green-800"
                      >
                        Pay
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(bill)}
                      className="mr-3 text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(bill._id)}
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

        {bills.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No bills found.
          </div>
        )}

      </div>

      {/* Modal */}
      {showForm && (

        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-2xl font-bold text-gray-800">
                {editingBill ? "Edit Bill" : "Add Bill"}
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

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Resident Name
                </label>

                <input
                  type="text"
                  name="residentName"
                  value={formData.residentName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Room Number
                </label>

                <input
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Monthly Rent
                </label>

                <input
                  type="number"
                  name="rent"
                  value={formData.rent}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Other Charges
                </label>

                <input
                  type="number"
                  name="otherCharges"
                  value={formData.otherCharges}
                  onChange={handleChange}
                  min="0"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Payment Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

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
                  {editingBill ? "Update Bill" : "Add Bill"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Billing;