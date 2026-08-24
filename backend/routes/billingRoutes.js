const express = require("express");
const { auth, allowRoles } = require("../middleware/auth");
const Billing = require("../models/Billing");
const Notification = require("../models/Notification");

const router = express.Router();

router.use(auth);

/* =========================
   GET ALL BILLS
   Admin / Manager / Staff
========================= */

router.get(
  "/",
  allowRoles("Admin", "Manager", "Staff"),
  async (req, res) => {
    try {
      const bills = await Billing.find().sort({ createdAt: -1 });

      res.json({
        success: true,
        data: bills,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch bills",
        error: error.message,
      });
    }
  }
);

/* =========================
   CREATE BILL
   Admin / Manager
========================= */

router.post(
  "/",
  allowRoles("Admin", "Manager"),
  async (req, res) => {
    try {
      const {
        residentName,
        roomNumber,
        rent,
        otherCharges,
        discount,
        lateFee,
        status,
      } = req.body;

      if (!residentName || !roomNumber || rent === undefined) {
        return res.status(400).json({
          success: false,
          message: "Resident name, room number and rent are required",
        });
      }

      const rentAmount = Number(rent) || 0;
      const other = Number(otherCharges) || 0;
      const discountAmount = Number(discount) || 0;
      const late = Number(lateFee) || 0;

      if (
        rentAmount < 0 ||
        other < 0 ||
        discountAmount < 0 ||
        late < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Billing amounts cannot be negative",
        });
      }

      const totalAmount = Math.max(
        0,
        rentAmount + other + late - discountAmount
      );

      const bill = await Billing.create({
        residentName: residentName.trim(),
        roomNumber: roomNumber.trim(),
        rent: rentAmount,
        otherCharges: other,
        discount: discountAmount,
        lateFee: late,
        totalAmount,
        status: status || "Pending",
      });

      await Notification.create({
        title: "New bill generated",
        message: `Bill for ${bill.residentName}: ₹${bill.totalAmount}`,
        type: "billing",
      });

      res.status(201).json({
        success: true,
        message: "Bill added successfully",
        data: bill,
      });
    } catch (error) {
      console.error("Create bill error:", error);

      res.status(400).json({
        success: false,
        message: "Failed to add bill",
        error: error.message,
      });
    }
  }
);

/* =========================
   UPDATE BILL
   Admin / Manager
========================= */

router.put("/:id", async (req, res) => {
  try {
    const {
      residentName,
      roomNumber,
      rent,
      otherCharges,
      discount,
      lateFee,
      status,
    } = req.body;

    const finalRent = Number(rent) || 0;
    const finalOtherCharges = Number(otherCharges) || 0;
    const finalDiscount = Number(discount) || 0;
    const finalLateFee = Number(lateFee) || 0;

    const totalAmount = Math.max(
      0,
      finalRent +
        finalOtherCharges +
        finalLateFee -
        finalDiscount
    );

    const bill = await Billing.findByIdAndUpdate(
      req.params.id,
      {
        residentName,
        roomNumber,
        rent: finalRent,
        otherCharges: finalOtherCharges,
        discount: finalDiscount,
        lateFee: finalLateFee,
        totalAmount,
        status,
      },
      {
        returnDocument:"after",
        runValidators: true,
      }
    );

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    res.json({
      success: true,
      message: "Bill updated successfully",
      data: bill,
    });
  } catch (error) {
    console.error("Update bill error:", error);

    res.status(400).json({
      success: false,
      message: "Failed to update bill",
      error: error.message,
    });
  }
});
/* =========================
   DELETE BILL
   Admin only
========================= */

router.delete(
  "/:id",
  allowRoles("Admin"),
  async (req, res) => {
    try {
      const bill = await Billing.findByIdAndDelete(req.params.id);

      if (!bill) {
        return res.status(404).json({
          success: false,
          message: "Bill not found",
        });
      }

      res.json({
        success: true,
        message: "Bill deleted successfully",
      });
    } catch (error) {
      console.error("Delete bill error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to delete bill",
        error: error.message,
      });
    }
  }
);

module.exports = router;