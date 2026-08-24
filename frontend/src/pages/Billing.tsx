import { apiFetch } from "../services/api";
import { useEffect, useState } from "react";

interface Bill {
  _id: string;
  residentName: string;
  roomNumber: string;
  rent: number;
  otherCharges: number;
  discount: number;
  lateFee: number;
  totalAmount: number;
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
  discount: "0",
  lateFee: "0",
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
      discount:"0",
      lateFee:"0",
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
  discount: Number(formData.discount),
  lateFee: Number(formData.lateFee),
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
      discount: String(bill.discount || 0),
      lateFee: String(bill.lateFee || 0),
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
  return (
    bill.rent +
    bill.otherCharges +
    bill.lateFee -
    bill.discount
  );
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
  <div className="min-h-screen bg-slate-50 p-4 md:p-6">

    {/* ================= HEADER ================= */}
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-2xl text-white shadow-lg">
            ₹
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">
              Billing
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage resident bills and payments
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          setEditingBill(null);

          setFormData({
            residentName: "",
            roomNumber: "",
            rent: "",
            otherCharges: "0",
            discount: "0",
            lateFee:"0",
            status: "Pending",
          });

          setShowForm(true);
        }}
        className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
      >
        <span className="text-xl transition group-hover:rotate-90">
          +
        </span>

        Add Bill
      </button>

    </div>


    {/* ================= SUMMARY CARDS ================= */}

    <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">

      {/* Total */}
      <div className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-100 opacity-60" />

        <div className="relative">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Billing
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-800">
                ₹{totalAmount.toLocaleString("en-IN")}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-600">
              ₹
            </div>

          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-full rounded-full bg-blue-500" />
          </div>

        </div>
      </div>


      {/* Paid */}
      <div className="group relative overflow-hidden rounded-2xl border border-green-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-green-100 opacity-60" />

        <div className="relative">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Paid Amount
              </p>

              <h2 className="mt-2 text-3xl font-bold text-green-600">
                ₹{paidAmount.toLocaleString("en-IN")}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-xl text-green-600">
              ✓
            </div>

          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-green-50">
            <div
              className="h-full rounded-full bg-green-500"
              style={{
                width:
                  totalAmount > 0
                    ? `${Math.min(
                        (paidAmount / totalAmount) * 100,
                        100
                      )}%`
                    : "0%",
              }}
            />
          </div>

        </div>
      </div>


      {/* Pending */}
      <div className="group relative overflow-hidden rounded-2xl border border-orange-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-orange-100 opacity-60" />

        <div className="relative">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Pending Amount
              </p>

              <h2 className="mt-2 text-3xl font-bold text-orange-600">
                ₹{pendingAmount.toLocaleString("en-IN")}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-xl text-orange-600">
              !
            </div>

          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-orange-50">
            <div
              className="h-full rounded-full bg-orange-500"
              style={{
                width:
                  totalAmount > 0
                    ? `${Math.min(
                        (pendingAmount / totalAmount) * 100,
                        100
                      )}%`
                    : "0%",
              }}
            />
          </div>

        </div>
      </div>

    </div>


    {/* ================= BILLING TABLE ================= */}

    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* Table Header */}

      <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">

        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Billing Records
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View and manage all resident payments
          </p>
        </div>

        <div className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
          {bills.length} {bills.length === 1 ? "Bill" : "Bills"}
        </div>

      </div>


      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-50">

            <tr>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Resident
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Room
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Rent
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Other Charges
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Total
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

            {bills.map((bill) => (

              <tr
                key={bill._id}
                className="group transition hover:bg-slate-50"
              >

                {/* Resident */}

                <td className="px-6 py-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full 
                    bg-gradient-to-br from-blue-500 to-indigo-500 font-bold text-white shadow-sm">
                      {bill.residentName
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        {bill.residentName}
                      </p>

                      <p className="text-xs text-slate-400">
                        Resident
                      </p>
                    </div>

                  </div>

                </td>


                {/* Room */}

                <td className="px-6 py-5">

                  <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                    Room {bill.roomNumber}
                  </span>

                </td>


                {/* Rent */}

                <td className="px-6 py-5 font-medium text-slate-700">
                  ₹{bill.rent.toLocaleString("en-IN")}
                </td>


                {/* Other */}

                <td className="px-6 py-5 font-medium text-slate-600">
                  ₹{bill.otherCharges.toLocaleString("en-IN")}
                </td>


                {/* Total */}

                <td className="px-6 py-5">

                  <span className="font-bold text-slate-800">
                    ₹{getTotal(bill).toLocaleString("en-IN")}
                  </span>

                </td>

                {/* Discount + Late Fee */}

<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

  {/* Discount */}

  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      Discount
    </label>

    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400">
        ₹
      </span>

      <input
        type="number"
        name="discount"
        value={formData.discount}
        onChange={handleChange}
        min="0"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
      />
    </div>
  </div>

  {/* Late Fee */}

  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      Late Fee
    </label>

    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400">
        ₹
      </span>

      <input
        type="number"
        name="lateFee"
        value={formData.lateFee}
        onChange={handleChange}
        min="0"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
      />
    </div>
  </div>

</div>


                {/* Status */}

                <td className="px-6 py-5">

                  {bill.status === "Paid" ? (

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Paid
                    </span>

                  ) : (

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 ring-1 ring-inset ring-orange-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                      Pending
                    </span>

                  )}

                </td>


                {/* Actions */}

                <td className="px-6 py-5">

                  <div className="flex items-center gap-2">

                    {bill.status !== "Paid" && (

                      <button
                        onClick={() => payBill(bill)}
                        className="rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-600 hover:text-white"
                      >
                        Pay
                      </button>

                    )}

                    <button
                      onClick={() => handleEdit(bill)}
                      className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-600 hover:text-white"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(bill._id)}
                      className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-600 hover:text-white"
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

      {bills.length === 0 && (

        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
            ₹
          </div>

          <h3 className="text-lg font-bold text-slate-700">
            No bills found
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Add your first resident bill to get started.
          </p>

        </div>

      )}

    </div>


    {/* ================= ADD / EDIT MODAL ================= */}

    {showForm && (

<div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
<div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
          {/* Modal Header */}

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 text-white">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-bold">
                  {editingBill
                    ? "Edit Bill"
                    : "Add New Bill"}
                </h2>

                <p className="mt-1 text-sm text-blue-100">
                  Enter billing information below
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


          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5 p-6"
          >

            {/* Resident */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Resident Name
              </label>

              <input
                type="text"
                name="residentName"
                value={formData.residentName}
                onChange={handleChange}
                placeholder="Enter resident name"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

            </div>


            {/* Room */}

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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

            </div>


            {/* Rent + Other Charges */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Monthly Rent
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    name="rent"
                    value={formData.rent}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                </div>

              </div>


              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Other Charges
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    name="otherCharges"
                    value={formData.otherCharges}
                    onChange={handleChange}
                    min="0"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                </div>

              </div>

            </div>

            {/* Discount + Late Fee */}

<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

  {/* Discount */}

  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      Discount
    </label>

    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400">
        ₹
      </span>

      <input
        type="number"
        name="discount"
        value={formData.discount}
        onChange={handleChange}
        min="0"
        placeholder="0"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
      />
    </div>
  </div>

  {/* Late Fee */}

  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      Late Fee
    </label>

    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400">
        ₹
      </span>

      <input
        type="number"
        name="lateFee"
        value={formData.lateFee}
        onChange={handleChange}
        min="0"
        placeholder="0"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
      />
    </div>
  </div>

</div>


            {/* Status */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Payment Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >

                <option value="Pending">
                  Pending
                </option>

                <option value="Paid">
                  Paid
                </option>

              </select>

            </div>


            {/* Preview */}

            <div className="rounded-2xl bg-slate-50 p-4">

              <div className="flex items-center justify-between">

                <span className="text-sm font-medium text-slate-500">
                  Total Amount
                </span>

               <span className="text-xl font-bold text-slate-800">
  ₹
  {Math.max(
    0,
    Number(formData.rent || 0) +
      Number(formData.otherCharges || 0) +
      Number(formData.lateFee || 0) -
      Number(formData.discount || 0)
  ).toLocaleString("en-IN")}
</span>

              </div>

            </div>


            {/* Buttons */}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
              >
                {editingBill
                  ? "Update Bill"
                  : "Add Bill"}
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