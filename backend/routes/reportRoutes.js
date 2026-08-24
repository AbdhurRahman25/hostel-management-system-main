const express = require("express");
const Room = require("../models/Room");
const Resident = require("../models/Resident");
const Maintenance = require("../models/Maintenance");
const Billing = require("../models/Billing");
const Payment = require("../models/Payment");
const Expense = require("../models/Expense");
const { auth, allowRoles } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/summary",
  auth,
  allowRoles("Admin", "Manager"),
  async (req, res) => {
    try {
      const [rooms, residents, maintenance, bills, payments,expensesData] =
        await Promise.all([
          Room.find(),
          Resident.find(),
          Maintenance.find(),
          Billing.find(),
          Payment.find({ status: "Paid" }),
          Expense.find(),
        ]);

      // ================= ROOM / OCCUPANCY =================

      const totalRooms = rooms.length;

      const capacity = rooms.reduce(
        (total, room) => total + Number(room.capacity || 0),
        0
      );

      const occupied = rooms.reduce(
        (total, room) => total + Number(room.occupied || 0),
        0
      );

      const availableBeds = Math.max(0, capacity - occupied);

      const occupancyRate = capacity
        ? Math.round((occupied / capacity) * 100)
        : 0;

      // ================= BILLING =================

      const totalBilling = bills.reduce(
        (total, bill) =>
          total +
          Number(
            bill.totalAmount ??
              (
                Number(bill.rent || 0) +
                Number(bill.otherCharges || 0) +
                Number(bill.lateFee || 0) -
                Number(bill.discount || 0)
              )
          ),
        0
      );

      // ================= PAYMENTS =================

      const collected = payments.reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      );

      const pending = Math.max(0, totalBilling - collected);

      // ================= EXPENSES =================

      
      const expenses= expensesData.reduce((total,expense) =>
      total + Number(expense.amount || 0),0);

      const netRevenue = collected - expenses;

      // ================= MONTHLY REVENUE =================

      const byMonth = {};

      bills.forEach((bill) => {
        const key = new Date(bill.createdAt).toLocaleString(
          "en-IN",
          {
            month: "short",
            year: "numeric",
          }
        );

        const amount = Number(
          bill.totalAmount ??
            (
              Number(bill.rent || 0) +
              Number(bill.otherCharges || 0) +
              Number(bill.lateFee || 0) -
              Number(bill.discount || 0)
            )
        );

        byMonth[key] = (byMonth[key] || 0) + amount;
      });

      const monthlyRevenue = Object.entries(byMonth).map(
        ([month, amount]) => ({
          month,
          amount,
        })
      );

      // ================= RESPONSE =================

      res.json({
        success: true,

        data: {
          // Rooms
          totalRooms,
          capacity,
          occupied,
          availableBeds,
          occupancyRate,

          // Residents
          activeResidents: residents.filter(
            (resident) => resident.status === "Active"
          ).length,

          // Billing
          totalBilling,
          collected,
          pending,

          // Expenses
          expenses,
          netRevenue,

          // Maintenance
          maintenanceTotal: maintenance.length,

          maintenancePending: maintenance.filter(
            (item) => item.status !== "Completed"
          ).length,

          maintenanceCompleted: maintenance.filter(
            (item) => item.status === "Completed"
          ).length,

          // Monthly revenue
          monthlyRevenue,
        },
      });
    } catch (e) {
      console.error("Report generation error:", e);

      res.status(500).json({
        success: false,
        message: "Report generation failed",
        error: e.message,
      });
    }
  }
);

module.exports = router;