const express = require("express");
const { auth, allowRoles } = require("../middleware/auth");
const Maintenance = require("../models/Maintenance");
const Notification = require("../models/Notification");

const router = express.Router();
router.use(auth);

// GET all maintenance requests
router.get("/",allowRoles("Admin","Manager","Staff"), async (req, res) => {
  try {
    const requests = await Maintenance.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch maintenance requests",
      error: error.message,
    });
  }
});

// POST maintenance request
router.post("/",allowRoles("Admin","Manager","Staff","Resident"), async (req, res) => {
  try {
    const request = await Maintenance.create(req.body);
    await Notification.create({title:"New maintenance request",message:`${request.title} for room ${request.roomNumber} (${request.priority} priority)`,type:"maintenance"});

    res.status(201).json({
      success: true,
      message: "Maintenance request added successfully",
      data: request,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to add maintenance request",
      error: error.message,
    });
  }
});

// PUT maintenance request
router.put("/:id",allowRoles("Admin","Manager","Staff"), async (req, res) => {
  try {
    const request = await Maintenance.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Maintenance request not found",
      });
    }

    await Notification.create({title:"Maintenance request updated",message:`${request.title} is now ${request.status}`,type:"maintenance"});

    res.json({
      success: true,
      message: "Maintenance request updated successfully",
      data: request,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update maintenance request",
      error: error.message,
    });
  }
});

// DELETE maintenance request
router.delete("/:id",allowRoles("Admin","Manager"), async (req, res) => {
  try {
    const request = await Maintenance.findByIdAndDelete(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Maintenance request not found",
      });
    }

    res.json({
      success: true,
      message: "Maintenance request deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete maintenance request",
      error: error.message,
    });
  }
});

module.exports = router;