const express = require("express");
const { auth } = require("../middleware/auth");
const Billing = require("../models/Billing");
const Notification = require("../models/Notification");

const router = express.Router();
router.use(auth);

// GET all bills
router.get("/", async (req, res) => {
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
});

// POST bill
router.post("/", async (req, res) => {
  try {
    const bill = await Billing.create(req.body);
    await Notification.create({title:"New bill generated",message:`Bill for ${bill.residentName}: ₹${bill.rent + bill.otherCharges}`,type:"billing"});

    res.status(201).json({
      success: true,
      message: "Bill added successfully",
      data: bill,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to add bill",
      error: error.message,
    });
  }
});

// PUT bill
router.put("/:id", async (req, res) => {
  try {
    const bill = await Billing.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
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
    res.status(400).json({
      success: false,
      message: "Failed to update bill",
      error: error.message,
    });
  }
});

// DELETE bill
router.delete("/:id", async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: "Failed to delete bill",
      error: error.message,
    });
  }
});

module.exports = router;