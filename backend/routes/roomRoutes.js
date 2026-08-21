const express = require("express");
const { auth } = require("../middleware/auth");
const Room = require("../models/Room");

const router = express.Router();
router.use(auth);

// GET - Get all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });

    res.json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch rooms",
      error: error.message,
    });
  }
});

// GET - Get single room
router.get("/:id", async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.json({
      success: true,
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch room",
      error: error.message,
    });
  }
});

// POST - Add room
router.post("/", async (req, res) => {
  try {
    const newRoom = await Room.create(req.body);

    res.status(201).json({
      success: true,
      message: "Room added successfully",
      data: newRoom,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to add room",
      error: error.message,
    });
  }
});

// PUT - Update room
router.put("/:id", async (req, res) => {
  try {
    // First get the existing room
    const existingRoom = await Room.findById(req.params.id);

    if (!existingRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Use new values if provided, otherwise use existing values
    const capacity =
      req.body.capacity !== undefined
        ? Number(req.body.capacity)
        : existingRoom.capacity;

    const occupied =
      req.body.occupied !== undefined
        ? Number(req.body.occupied)
        : existingRoom.occupied;

    // Validate occupied beds
    if (occupied > capacity) {
      return res.status(400).json({
        success: false,
        message:
          "Occupied beds cannot be greater than capacity",
      });
    }

    // Update room
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    res.json({
      success: true,
      message: "Room updated successfully",
      data: updatedRoom,
    });
  } catch (error) {
    console.error("Update room error:", error);

    res.status(400).json({
      success: false,
      message: "Failed to update room",
      error: error.message,
    });
  }
});

// DELETE - Delete room
router.delete("/:id", async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);

    if (!deletedRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.json({
      success: true,
      message: "Room deleted successfully",
      data: deletedRoom,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete room",
      error: error.message,
    });
  }
});

module.exports = router;