const express = require("express");
const { auth } = require("../middleware/auth");
const mongoose = require("mongoose");
const Resident = require("../models/Resident");
const Room = require("../models/Room");

const router = express.Router();
router.use(auth);

// =========================
// GET ALL RESIDENTS
// =========================

router.get("/", async (req, res) => {
  try {
    const residents = await Resident.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: residents,
    });
  } catch (error) {
    console.error("Get residents error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch residents",
      error: error.message,
    });
  }
});

// =========================
// GET SINGLE RESIDENT
// =========================

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resident ID",
      });
    }

    const resident = await Resident.findById(id);

    if (!resident) {
      return res.status(404).json({
        success: false,
        message: "Resident not found",
      });
    }

    res.json({
      success: true,
      data: resident,
    });
  } catch (error) {
    console.error("Get resident error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch resident",
      error: error.message,
    });
  }
});

// =========================
// ADD RESIDENT
// =========================

router.post("/", async (req, res) => {
  try {
    const resident = await Resident.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      gender: req.body.gender,

      emergencyContact: {
        name: req.body.emergencyContact?.name || "",
        phone: req.body.emergencyContact?.phone || "",
        relationship:
          req.body.emergencyContact?.relationship || "",
      },

      status: "Active",
    });

    res.status(201).json({
      success: true,
      message: "Resident added successfully",
      data: resident,
    });
  } catch (error) {
    console.error("Add resident error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add resident",
      error: error.message,
    });
  }
});

// =========================
// UPDATE RESIDENT
// =========================

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resident ID",
      });
    }

    const resident = await Resident.findByIdAndUpdate(
      id,
      {
        $set: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          phone: req.body.phone,
          gender: req.body.gender,

          emergencyContact: {
            name:
              req.body.emergencyContact?.name || "",
            phone:
              req.body.emergencyContact?.phone || "",
            relationship:
              req.body.emergencyContact
                ?.relationship || "",
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!resident) {
      return res.status(404).json({
        success: false,
        message: "Resident not found",
      });
    }

    res.json({
      success: true,
      message: "Resident updated successfully",
      data: resident,
    });
  } catch (error) {
    console.error("Update resident error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update resident",
      error: error.message,
    });
  }
});

// =========================
// DELETE RESIDENT
// =========================

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resident ID",
      });
    }

    const resident =
      await Resident.findByIdAndDelete(id);

    if (!resident) {
      return res.status(404).json({
        success: false,
        message: "Resident not found",
      });
    }

    res.json({
      success: true,
      message: "Resident deleted successfully",
      data: resident,
    });
  } catch (error) {
    console.error("Delete resident error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete resident",
      error: error.message,
    });
  }
});

// =========================
// ALLOCATE ROOM / CHECK IN
// =========================

router.post("/:id/allocate", async (req, res) => {
  try {
    const { id } = req.params;
    const { roomId, checkInDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resident ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID",
      });
    }

    const resident = await Resident.findById(id);

    if (!resident) {
      return res.status(404).json({
        success: false,
        message: "Resident not found",
      });
    }

    if (resident.roomId) {
      return res.status(400).json({
        success: false,
        message: "Resident is already allocated to a room",
      });
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (room.status === "Maintenance") {
      return res.status(400).json({
        success: false,
        message: "Room is under maintenance",
      });
    }

    if (room.occupied >= room.capacity) {
      return res.status(400).json({
        success: false,
        message: "Room is already full",
      });
    }

    // Update resident
    resident.roomId = room._id;
    resident.roomNumber = room.roomNumber;
    resident.checkInDate = checkInDate || new Date();
    resident.checkOutDate = null;
    resident.status = "Active";

    await resident.save();

    // Update room
    room.occupied += 1;

    room.status =
      room.occupied >= room.capacity
        ? "Occupied"
        : "Available";

    await room.save();

    res.json({
      success: true,
      message: "Room allocated and resident checked in successfully",
      data: {
        resident,
        room,
      },
    });
  } catch (error) {
    console.error("Allocation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to allocate room",
      error: error.message,
    });
  }
});

// =========================
// CHECK OUT RESIDENT
// =========================

router.post("/:id/checkout", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resident ID",
      });
    }

    const resident = await Resident.findById(id);

    if (!resident) {
      return res.status(404).json({
        success: false,
        message: "Resident not found",
      });
    }

    if (!resident.roomId) {
      return res.status(400).json({
        success: false,
        message: "Resident is not currently allocated to a room",
      });
    }

    const room = await Room.findById(resident.roomId);

    // Update room
    if (room) {
      room.occupied = Math.max(0, room.occupied - 1);

      room.status =
        room.occupied >= room.capacity
          ? "Occupied"
          : "Available";

      await room.save();
    }

    // Update resident
    resident.roomId = null;
    resident.roomNumber = null;
    resident.checkOutDate =
      req.body.checkOutDate || new Date();
    resident.status = "Checked Out";

    await resident.save();

    res.json({
      success: true,
      message: "Resident checked out successfully",
      data: resident,
    });
  } catch (error) {
    console.error("Checkout error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to checkout resident",
      error: error.message,
    });
  }
});
module.exports = router;